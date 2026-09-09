import { encodePreservedSource } from '../preservation/encodePreservedSource';
import { BlockNode } from '../types/BlockNode';
import { ConversionDiagnostic } from '../types/ConversionDiagnostic';
import { ConversionOptions } from '../types/ConversionOptions';
import { InlineNode } from '../types/InlineNode';
import { ParsedDocument } from '../types/ParsedDocument';
import { SerializationResult } from '../types/SerializationResult';
import { SourceRange } from '../types/SourceRange';

type SerializationContext = {
  document: ParsedDocument;
  options: ConversionOptions;
  diagnostics: ConversionDiagnostic[];
};

function escapeText(value: string): string {
  return value
    .replace(/[\\`*_[\]<>!#~|=$%^&]/g, '\\$&')
    .replace(/^(\d+)([.)])(?=[ \t])/gm, '$1\\$2')
    .replace(/^([-+])(?=[ \t])/gm, '\\$1');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeWikiPart(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\]/g, '\\]');
}

function longestRun(value: string, character: '`' | '~'): number {
  const runs: string[] = value.match(character === '`' ? /`+/g : /~+/g) ?? [];
  return runs.reduce((length, run) => Math.max(length, run.length), 0);
}

function codeSpan(value: string): string {
  if (value.includes('\n')) {
    return `<code>${escapeHtml(value).replace(/\n/g, '&#10;')}</code>`;
  }
  const marker = '`'.repeat(longestRun(value, '`') + 1);
  const hasEdgeBacktick = value.startsWith('`') || value.endsWith('`');
  const hasSpacesAtBothEdges =
    value.startsWith(' ') && value.endsWith(' ') && /[^ ]/.test(value);
  const padding = hasEdgeBacktick || hasSpacesAtBothEdges ? ' ' : '';
  return `${marker}${padding}${value}${padding}${marker}`;
}

function targetLink(
  target: string,
  kind: 'link' | 'embed',
  context: SerializationContext,
  external = false,
): string {
  if (external || !context.options.resolveLink) {
    return target;
  }
  return context.options.resolveLink(target, kind);
}

function markdownDestination(target: string): string {
  return `<${target.replace(/\\/g, '\\\\').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\n/g, '%0A')}>`;
}

function markdownTitle(title: string | undefined): string {
  if (title === undefined) {
    return '';
  }
  return ` "${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '&#10;')}"`;
}

function plainLabel(label: InlineNode[]): string | undefined {
  const onlyText = label.every((node) => node.type === 'text');
  if (!onlyText) {
    return undefined;
  }
  return label.map((node) => (node.type === 'text' ? node.value : '')).join('');
}

function emitDiagnostic(
  context: SerializationContext,
  code: string,
  message: string,
  range?: SourceRange,
): void {
  context.diagnostics.push({
    code,
    message,
    severity: 'warning',
    range: range ?? { start: 0, end: context.document.source.length },
  });
}

function emitRaw(
  node: Extract<InlineNode | BlockNode, { type: 'raw' }>,
  context: SerializationContext,
): string {
  if (node.dialect === 'obsidian') {
    return node.value;
  }
  emitDiagnostic(
    context,
    'PRESERVED_SOURCE',
    `${node.reason} is retained as TiddlyWiki source in a preservation comment.`,
    node.range,
  );
  return encodePreservedSource({
    dialect: node.dialect,
    value: node.value,
    reason: node.reason,
  });
}

function renderHtmlInlines(
  nodes: InlineNode[],
  context: SerializationContext,
): string {
  const formattingTags: Record<string, string> = {
    strong: 'strong',
    emphasis: 'em',
    underline: 'u',
    strike: 'del',
    highlight: 'mark',
    superscript: 'sup',
    subscript: 'sub',
  };
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return escapeHtml(node.value);
      }
      if (node.type === 'code') {
        return `<code>${escapeHtml(node.value)}</code>`;
      }
      if (node.type === 'break') {
        return '<br>';
      }
      if ('children' in node) {
        const tag = formattingTags[node.type];
        return `<${tag}>${renderHtmlInlines(node.children, context)}</${tag}>`;
      }
      if (node.type === 'link') {
        const target = targetLink(node.target, 'link', context, node.external);
        const title =
          node.title === undefined ? '' : ` title="${escapeHtml(node.title)}"`;
        return `<a href="${escapeHtml(target)}"${title}>${renderHtmlInlines(node.label, context)}</a>`;
      }
      if (node.type === 'embed' && node.kind === 'image') {
        const target = targetLink(
          node.target,
          'embed',
          context,
          /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.target),
        );
        const title =
          node.title === undefined ? '' : ` title="${escapeHtml(node.title)}"`;
        const width =
          node.width === undefined ? '' : ` width="${escapeHtml(node.width)}"`;
        const height =
          node.height === undefined
            ? ''
            : ` height="${escapeHtml(node.height)}"`;
        return `<img src="${escapeHtml(target)}" alt="${escapeHtml(node.alt)}"${title}${width}${height}>`;
      }
      // HTML wrappers disable Markdown parsing in Obsidian. Keep foreign constructs explicit.
      return escapeHtml(renderInline(node, context));
    })
    .join('');
}

function renderLink(
  node: Extract<InlineNode, { type: 'link' }>,
  context: SerializationContext,
): string {
  const target = targetLink(node.target, 'link', context, node.external);
  const label = plainLabel(node.label);
  const useWikiLink =
    !node.external &&
    label !== undefined &&
    node.title === undefined &&
    !target.includes('\n');
  if (useWikiLink) {
    const encodedTarget = escapeWikiPart(target);
    if (label === node.target || label === target) {
      return `[[${encodedTarget}]]`;
    }
    return `[[${encodedTarget}|${escapeWikiPart(label)}]]`;
  }
  return `[${renderInlines(node.label, context)}](${markdownDestination(target)}${markdownTitle(node.title)})`;
}

function renderEmbed(
  node: Extract<InlineNode, { type: 'embed' }>,
  context: SerializationContext,
): string {
  const ambiguousImageTransclusion =
    node.kind === 'note' &&
    /\.(?:avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)(?:#.*)?$/i.test(node.target);
  if (ambiguousImageTransclusion) {
    const source =
      node.range && context.document.dialect === 'tiddlywiki'
        ? context.document.source.slice(node.range.start, node.range.end)
        : `{{${node.target}}}`;
    return emitRaw(
      {
        type: 'raw',
        dialect: 'tiddlywiki',
        value: source,
        reason: 'TiddlyWiki transclusion of an image-like title',
        range: node.range,
      },
      context,
    );
  }
  const external = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.target);
  const hasSize = node.width !== undefined || node.height !== undefined;
  const literalNumericAlt = !hasSize && /^\d+(?:x\d+)?$/.test(node.alt);
  const needsHtmlSize =
    node.kind === 'image' &&
    (literalNumericAlt ||
      (hasSize &&
        (Boolean(node.alt) ||
          node.title !== undefined ||
          external ||
          node.width === undefined)));
  if (needsHtmlSize) {
    return renderHtmlInlines([node], context);
  }
  const target = targetLink(node.target, 'embed', context, external);
  const useWikiEmbed =
    node.kind === 'note' ||
    (!external &&
      node.title === undefined &&
      (!node.alt || node.width !== undefined));
  if (useWikiEmbed) {
    let alias = node.alt;
    if (node.width) {
      alias = `${node.width}${node.height ? `x${node.height}` : ''}`;
    }
    return `![[${escapeWikiPart(target)}${alias ? `|${escapeWikiPart(alias)}` : ''}]]`;
  }
  return `![${escapeText(node.alt)}](${markdownDestination(target)}${markdownTitle(node.title)})`;
}

function renderInline(
  node: InlineNode,
  context: SerializationContext,
  marker?: string,
): string {
  switch (node.type) {
    case 'text':
      return escapeText(node.value);
    case 'code':
      return codeSpan(node.value);
    case 'strong': {
      if (needsStaticFormatting(node)) {
        return renderHtmlInlines([node], context);
      }
      const delimiter = marker ?? '**';
      return `${delimiter}${renderInlines(node.children, context, delimiter[0])}${delimiter}`;
    }
    case 'emphasis': {
      if (needsStaticFormatting(node)) {
        return renderHtmlInlines([node], context);
      }
      const delimiter = marker ?? '_';
      return `${delimiter}${renderInlines(node.children, context, delimiter[0])}${delimiter}`;
    }
    case 'strike':
      return `~~${renderInlines(node.children, context)}~~`;
    case 'highlight':
      return `==${renderInlines(node.children, context)}==`;
    case 'underline':
      return `<u>${renderHtmlInlines(node.children, context)}</u>`;
    case 'superscript':
      return `<sup>${renderHtmlInlines(node.children, context)}</sup>`;
    case 'subscript':
      return `<sub>${renderHtmlInlines(node.children, context)}</sub>`;
    case 'link':
      return renderLink(node, context);
    case 'embed':
      return renderEmbed(node, context);
    case 'break':
      return node.hard ? '  \n' : '\n';
    case 'math':
      return `$${node.value}$`;
    case 'footnoteReference':
      return `[^${node.identifier}]`;
    case 'raw':
      return emitRaw(node, context);
  }
}

function isAsteriskFormatting(node: InlineNode | undefined): boolean {
  return node?.type === 'strong' || node?.type === 'emphasis';
}

function staticHtmlSupported(node: InlineNode): boolean {
  if ('children' in node) {
    return node.children.every(staticHtmlSupported);
  }
  if (node.type === 'link') {
    return node.label.every(staticHtmlSupported);
  }
  return (
    node.type === 'text' ||
    node.type === 'code' ||
    (node.type === 'embed' && node.kind === 'image') ||
    (node.type === 'break' && node.hard)
  );
}

function formattingDepth(node: InlineNode): number {
  if (!('children' in node)) {
    return 0;
  }
  const childDepth = Math.max(0, ...node.children.map(formattingDepth));
  return isAsteriskFormatting(node) ? 1 + childDepth : childDepth;
}

function needsStaticFormatting(node: InlineNode): boolean {
  return formattingDepth(node) >= 3 && staticHtmlSupported(node);
}

function renderInlines(
  nodes: InlineNode[],
  context: SerializationContext,
  parentMarker?: string,
): string {
  const mergedNodes: InlineNode[] = [];
  for (const node of nodes) {
    const previous = mergedNodes[mergedNodes.length - 1];
    if (node.type === 'text' && previous?.type === 'text') {
      previous.value += node.value;
    } else {
      mergedNodes.push({ ...node });
    }
  }
  let previousMarker: string | undefined;
  return mergedNodes
    .map((node, index) => {
      const previous = mergedNodes[index - 1];
      const next = mergedNodes[index + 1];
      if (node.type === 'text') {
        previousMarker = undefined;
        const characters = Array.from(node.value);
        let prefix = '';
        let suffix = '';
        const protectStart =
          isAsteriskFormatting(previous) &&
          characters.length > 0 &&
          !/\s/.test(characters[0]);
        if (protectStart) {
          prefix = `&#${characters.shift()?.codePointAt(0)};`;
        }
        const protectEnd =
          isAsteriskFormatting(next) &&
          characters.length > 0 &&
          !/\s/.test(characters[characters.length - 1]);
        if (protectEnd) {
          suffix = `&#${characters.pop()?.codePointAt(0)};`;
        }
        return `${prefix}${escapeText(characters.join(''))}${suffix}`;
      }
      if (node.type === 'strong' || node.type === 'emphasis') {
        const preferred = node.type === 'strong' ? '*' : '_';
        const conflict = previousMarker ?? parentMarker;
        const character =
          preferred === conflict ? (preferred === '*' ? '_' : '*') : preferred;
        previousMarker = character;
        const marker = character.repeat(node.type === 'strong' ? 2 : 1);
        return renderInline(node, context, marker);
      }
      previousMarker = undefined;
      return renderInline(node, context);
    })
    .join('');
}

function renderCode(block: Extract<BlockNode, { type: 'code' }>): string {
  const fenceCharacter = block.language.includes('`') ? '~' : '`';
  const fence = fenceCharacter.repeat(
    Math.max(3, longestRun(block.value, fenceCharacter) + 1),
  );
  return `${fence}${block.language}\n${block.value}\n${fence}`;
}

function renderList(
  block: Extract<BlockNode, { type: 'list' }>,
  context: SerializationContext,
  alternate = false,
): string {
  return block.children
    .map((entry, index) => {
      const marker = block.ordered
        ? `${block.start + index}${alternate ? ')' : '.'} `
        : alternate
          ? '+ '
          : '- ';
      const taskMarker = entry.checked ? (entry.taskMarker ?? 'x') : ' ';
      const check = entry.checked === undefined ? '' : `[${taskMarker}] `;
      const body = `${check}${renderBlocks(entry.blocks, context)}`;
      const lines = body.split('\n');
      return `${marker}${lines[0]}${lines
        .slice(1)
        .map((line) => `\n${line ? ' '.repeat(marker.length) + line : ''}`)
        .join('')}`;
    })
    .join('\n');
}

function escapeTablePipes(source: string): string {
  return source.replace(/(^|[^\\])((?:\\\\)*)\|/g, '$1$2\\|');
}

function renderTable(
  block: Extract<BlockNode, { type: 'table' }>,
  context: SerializationContext,
): string {
  const renderCell = (cell: InlineNode[]): string => {
    const content = cell
      .map((node) => {
        if (node.type === 'break') {
          return '<br>';
        }
        const codeWithBackslashPipe =
          node.type === 'code' && /\\+\|/.test(node.value);
        if (codeWithBackslashPipe && node.type === 'code') {
          return `<code>${escapeHtml(node.value).replace(/\|/g, '&#124;')}</code>`;
        }
        return renderInline(node, context);
      })
      .join('');
    return escapeTablePipes(content);
  };
  const renderRow = (cells: InlineNode[][]): string =>
    `| ${cells.map(renderCell).join(' | ')} |`;
  const alignments = block.header.map((_, index) => {
    const alignment = block.alignments[index];
    return alignment === 'left'
      ? ':---'
      : alignment === 'right'
        ? '---:'
        : alignment === 'center'
          ? ':---:'
          : '---';
  });
  const separator = `| ${alignments.join(' | ')} |`;
  return [
    renderRow(block.header),
    separator,
    ...block.rows.map(renderRow),
  ].join('\n');
}

function renderBlock(block: BlockNode, context: SerializationContext): string {
  switch (block.type) {
    case 'paragraph':
      return renderInlines(block.children, context);
    case 'heading':
      return `${'#'.repeat(Math.min(6, Math.max(1, block.level)))} ${renderInlines(block.children, context)}`;
    case 'code':
      return renderCode(block);
    case 'thematicBreak':
      return '***';
    case 'list':
      return renderList(block, context);
    case 'table':
      return renderTable(block, context);
    case 'math':
      return `$$\n${block.value}\n$$`;
    case 'raw':
      return emitRaw(block, context);
    case 'quote': {
      let content = renderBlocks(block.children, context);
      if (block.callout) {
        const titleContent = block.callout.titleNodes
          ? renderInlines(block.callout.titleNodes, context)
          : escapeText(block.callout.title);
        const title = `[!${block.callout.type}]${block.callout.fold ?? ''}${titleContent ? ` ${titleContent}` : ''}`;
        content = `${title}${content ? `\n${content}` : ''}`;
      }
      return content
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');
    }
    case 'footnoteDefinition': {
      const lines = renderBlocks(block.children, context).split('\n');
      return `[^${block.identifier}]: ${lines[0]}${lines
        .slice(1)
        .map((line) => `\n${line ? `    ${line}` : ''}`)
        .join('')}`;
    }
  }
}

function renderBlocks(
  blocks: BlockNode[],
  context: SerializationContext,
): string {
  let alternateListMarker = false;
  return blocks
    .map((block, index) => {
      const previous = blocks[index - 1];
      const continuesListKind =
        block.type === 'list' &&
        previous?.type === 'list' &&
        block.ordered === previous.ordered;
      alternateListMarker = continuesListKind ? !alternateListMarker : false;
      return block.type === 'list'
        ? renderList(block, context, alternateListMarker)
        : renderBlock(block, context);
    })
    .join('\n\n');
}

export function serializeObsidian(
  document: ParsedDocument,
  options: ConversionOptions = {},
): SerializationResult {
  const diagnostics: ConversionDiagnostic[] = [];
  const context = { document, options, diagnostics };
  const text = renderBlocks(document.blocks, context);
  return { text, diagnostics };
}
