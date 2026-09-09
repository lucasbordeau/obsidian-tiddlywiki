import MarkdownIt from 'markdown-it';
import { lexSource } from '../lexer/lexSource';
import { decodePreservedSource } from '../preservation/decodePreservedSource';
import { BlockNode } from '../types/BlockNode';
import { ConversionDiagnostic } from '../types/ConversionDiagnostic';
import { InlineNode } from '../types/InlineNode';
import { ListItem } from '../types/ListItem';
import { ParsedDocument } from '../types/ParsedDocument';
import { SourceRange } from '../types/SourceRange';
import { createObsidianParser } from './createObsidianParser';
import { parseStaticHtmlInline } from './parseStaticHtmlInline';
import { isObsidianWebEmbed } from './isObsidianWebEmbed';

type Token = MarkdownIt.Token;
type TokenCursor = { position: number };
type ParseContext = {
  source: string;
  lineOffsets: number[];
  diagnostics: ConversionDiagnostic[];
  markdown: MarkdownIt;
  environment: Record<string, unknown>;
};

function sourceRange(
  token: Token,
  context: ParseContext,
): SourceRange | undefined {
  if (!token.map || context.lineOffsets.length === 0) {
    return undefined;
  }
  return {
    start: context.lineOffsets[token.map[0]] ?? context.source.length,
    end: context.lineOffsets[token.map[1]] ?? context.source.length,
  };
}

function rawInline(value: string, reason: string): InlineNode {
  const preserved = decodePreservedSource(value);
  if (preserved) {
    return { type: 'raw', ...preserved };
  }
  return { type: 'raw', value, dialect: 'obsidian', reason };
}

function wikiParts(content: string): {
  target: string;
  alias: string | undefined;
} {
  let separator = -1;
  for (let position = 0; position < content.length; position++) {
    if (content[position] === '\\') {
      position++;
      continue;
    }
    if (content[position] === '|') {
      separator = position;
      break;
    }
  }
  const unescape = (value: string): string =>
    value.replace(/\\([\\|\]])/g, '$1');
  if (separator === -1) {
    return { target: unescape(content), alias: undefined };
  }
  return {
    target: unescape(content.slice(0, separator)),
    alias: unescape(content.slice(separator + 1)),
  };
}

function parseWikiToken(token: Token): InlineNode {
  const { target, alias } = wikiParts(token.content);
  if (token.type === 'otw_wikilink') {
    return {
      type: 'link',
      target,
      label: [{ type: 'text', value: alias ?? target }],
      external: false,
    };
  }
  const dimensions = /^(\d+)(?:x(\d+))?$/.exec(alias ?? '');
  const imageTarget =
    /\.(?:avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)(?:#.*)?$/i.test(target);
  const embed: InlineNode = {
    type: 'embed',
    target,
    kind: imageTarget ? 'image' : 'note',
    alt: dimensions ? '' : (alias ?? ''),
  };
  if (dimensions) {
    embed.width = dimensions[1];
    if (dimensions[2]) {
      embed.height = dimensions[2];
    }
  }
  return embed;
}

function htmlInline(value: string): InlineNode {
  const staticNodes = parseStaticHtmlInline(value);
  if (staticNodes?.length === 1) {
    return staticNodes[0];
  }
  const reason = /^<iframe\b/i.test(value)
    ? 'Obsidian iframe embed'
    : 'HTML content';
  return rawInline(value, reason);
}

function parseMarkdownImage(token: Token): InlineNode {
  const alt = inlinePlainText(inlineChildren(token));
  const embed: InlineNode = {
    type: 'embed',
    target: token.attrGet('src') ?? '',
    alt,
    kind: 'image',
  };
  const title = token.attrGet('title');
  if (title !== null) {
    embed.title = title;
  }
  if (isObsidianWebEmbed(embed.target)) {
    const titleSuffix =
      title === null ? '' : ` "${title.replace(/"/g, '\\"')}"`;
    return rawInline(
      `![${token.content}](<${embed.target}>${titleSuffix})`,
      'Obsidian web embed',
    );
  }
  const separator = token.content.lastIndexOf('|');
  let precedingBackslashes = 0;
  for (
    let position = separator - 1;
    position >= 0 && token.content[position] === '\\';
    position--
  ) {
    precedingBackslashes++;
  }
  const literalPipe = separator !== -1 && precedingBackslashes % 2 === 1;
  const dimensionText =
    separator === -1 ? token.content : token.content.slice(separator + 1);
  const dimensions = /^(\d+)(?:x(\d+))?$/.exec(dimensionText);
  if (!dimensions || literalPipe) {
    return embed;
  }
  embed.alt = separator === -1 ? '' : alt.slice(0, -(dimensionText.length + 1));
  embed.width = dimensions[1];
  if (dimensions[2] !== undefined) {
    embed.height = dimensions[2];
  }
  return embed;
}

function collectInlineNodes(
  tokens: Token[],
  cursor: TokenCursor,
  closingType?: string,
): InlineNode[] {
  const children: InlineNode[] = [];
  while (cursor.position < tokens.length) {
    const token = tokens[cursor.position++];
    if (token.type === closingType) {
      break;
    }
    switch (token.type) {
      case 'text':
      case 'text_special':
        children.push({ type: 'text', value: token.content });
        break;
      case 'code_inline':
        children.push({ type: 'code', value: token.content });
        break;
      case 'softbreak':
      case 'hardbreak':
        children.push({ type: 'break', hard: token.type === 'hardbreak' });
        break;
      case 'strong_open':
      case 'em_open':
      case 's_open': {
        const formatType =
          token.type === 'strong_open'
            ? 'strong'
            : token.type === 'em_open'
              ? 'emphasis'
              : 'strike';
        const formattedChildren = collectInlineNodes(
          tokens,
          cursor,
          token.type.replace('_open', '_close'),
        );
        children.push({ type: formatType, children: formattedChildren });
        break;
      }
      case 'link_open': {
        const target = token.attrGet('href') ?? '';
        const label = collectInlineNodes(tokens, cursor, 'link_close');
        const link: InlineNode = {
          type: 'link',
          target,
          label,
          external: /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target),
        };
        const title = token.attrGet('title');
        if (title !== null) {
          link.title = title;
        }
        children.push(link);
        break;
      }
      case 'image': {
        children.push(parseMarkdownImage(token));
        break;
      }
      case 'otw_wikilink':
      case 'otw_embed':
        children.push(parseWikiToken(token));
        break;
      case 'otw_highlight':
        children.push({
          type: 'highlight',
          children: collectInlineNodes(token.children ?? [], { position: 0 }),
        });
        break;
      case 'otw_math':
        children.push({ type: 'math', value: token.content });
        break;
      case 'otw_footnote_reference':
        children.push({ type: 'footnoteReference', identifier: token.content });
        break;
      case 'otw_inline_footnote':
        children.push(rawInline(token.content, 'Obsidian inline footnote'));
        break;
      case 'otw_web_embed':
        children.push(rawInline(token.content, 'Obsidian web embed'));
        break;
      case 'otw_comment':
        children.push(rawInline(token.content, 'Obsidian comment'));
        break;
      case 'otw_block_identifier':
        children.push(rawInline(token.content, 'Obsidian block identifier'));
        break;
      case 'html_inline':
      case 'otw_html':
        children.push(htmlInline(token.content));
        break;
      default:
        children.push(
          rawInline(
            token.content || token.markup,
            `Markdown inline token ${token.type}`,
          ),
        );
    }
  }
  return children.filter((node) => node.type !== 'text' || node.value !== '');
}

function inlineChildren(token: Token | undefined): InlineNode[] {
  return collectInlineNodes(token?.children ?? [], { position: 0 });
}

function inlinePlainText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if ('children' in node) {
        return inlinePlainText(node.children);
      }
      if (node.type === 'link') {
        return inlinePlainText(node.label);
      }
      if (node.type === 'embed') {
        return node.alt;
      }
      if (node.type === 'break') {
        return '\n';
      }
      if (node.type === 'footnoteReference') {
        return `[^${node.identifier}]`;
      }
      return node.value;
    })
    .join('');
}

function parseList(
  tokens: Token[],
  cursor: TokenCursor,
  opening: Token,
  context: ParseContext,
): BlockNode {
  const listEntries: ListItem[] = [];
  const closingType = opening.type.replace('_open', '_close');
  while (cursor.position < tokens.length) {
    const reachedClosingToken = tokens[cursor.position].type === closingType;
    if (reachedClosingToken) {
      break;
    }
    const entryToken = tokens[cursor.position++];
    if (entryToken.type !== 'list_item_open') {
      continue;
    }
    const firstInlineToken =
      tokens[cursor.position]?.type === 'paragraph_open'
        ? tokens[cursor.position + 1]
        : undefined;
    const task =
      firstInlineToken?.type === 'inline'
        ? /^\[([^\r\n])\](?:[ \t]+|$)/u.exec(firstInlineToken.content)
        : null;
    const blocks = collectBlocks(tokens, cursor, context, 'list_item_close');
    const entry: ListItem = { blocks };
    const range = sourceRange(entryToken, context);
    if (range) {
      entry.range = range;
    }
    const firstBlock = blocks[0];
    if (task && firstInlineToken && firstBlock?.type === 'paragraph') {
      entry.checked = task[1] !== ' ';
      if (entry.checked && task[1] !== 'x') {
        entry.taskMarker = task[1];
      }
      const taskBodyTokens: Token[] = [];
      context.markdown.inline.parse(
        firstInlineToken.content.slice(task[0].length),
        context.markdown,
        context.environment,
        taskBodyTokens,
      );
      firstBlock.children = collectInlineNodes(taskBodyTokens, { position: 0 });
    }
    listEntries.push(entry);
  }
  if (cursor.position < tokens.length) {
    cursor.position++;
  }
  return {
    type: 'list',
    ordered: opening.type === 'ordered_list_open',
    start: Number(opening.attrGet('start') ?? 1),
    children: listEntries,
  };
}

function parseTable(tokens: Token[], cursor: TokenCursor): BlockNode {
  const header: InlineNode[][] = [];
  const tableRows: InlineNode[][][] = [];
  const alignments: ('left' | 'right' | 'center' | null)[] = [];
  let currentCells: InlineNode[][] = [];
  let inHeader = false;
  while (cursor.position < tokens.length) {
    const token = tokens[cursor.position++];
    if (token.type === 'table_close') {
      break;
    }
    if (token.type === 'thead_open') {
      inHeader = true;
    }
    if (token.type === 'thead_close') {
      inHeader = false;
    }
    if (token.type === 'tr_open') {
      currentCells = [];
    }
    const cellOpening = token.type === 'th_open' || token.type === 'td_open';
    if (cellOpening) {
      currentCells.push(inlineChildren(tokens[cursor.position++]));
      if (inHeader) {
        const alignment = /text-align:(left|right|center)/.exec(
          token.attrGet('style') ?? '',
        );
        alignments.push(
          alignment ? (alignment[1] as 'left' | 'right' | 'center') : null,
        );
      }
    }
    if (token.type === 'tr_close') {
      if (inHeader) {
        header.push(...currentCells);
      } else {
        tableRows.push(currentCells);
      }
    }
  }
  return { type: 'table', header, rows: tableRows, alignments };
}

function parseQuote(
  tokens: Token[],
  cursor: TokenCursor,
  context: ParseContext,
): BlockNode {
  const children = collectBlocks(tokens, cursor, context, 'blockquote_close');
  const quote: BlockNode = { type: 'quote', children };
  const firstParagraph = children[0];
  const firstInline =
    firstParagraph?.type === 'paragraph'
      ? firstParagraph.children[0]
      : undefined;
  const calloutMatch =
    firstInline?.type === 'text'
      ? /^\[!([\w-]+)\]([+-])?(?:[ \t]+|$)/.exec(firstInline.value)
      : null;
  const hasCalloutHeader =
    calloutMatch !== null &&
    firstParagraph?.type === 'paragraph' &&
    firstInline?.type === 'text';
  if (!hasCalloutHeader) {
    return quote;
  }

  const titleNodes = firstParagraph.children;
  firstInline.value = firstInline.value.slice(calloutMatch[0].length);
  const titleEnd = titleNodes.findIndex((node) => node.type === 'break');
  const title = titleEnd === -1 ? titleNodes : titleNodes.slice(0, titleEnd);
  const titleText = inlinePlainText(title);
  const hasFormattedTitle = title.some((node) => node.type !== 'text');
  quote.callout = { type: calloutMatch[1], title: titleText };
  if (hasFormattedTitle) {
    quote.callout.titleNodes = title.filter(
      (node) => node.type !== 'text' || node.value !== '',
    );
  }
  if (calloutMatch[2]) {
    quote.callout.fold = calloutMatch[2] as '+' | '-';
  }
  if (titleEnd === -1) {
    children.shift();
  } else {
    firstParagraph.children = titleNodes.slice(titleEnd + 1);
  }
  return quote;
}

function collectBlocks(
  tokens: Token[],
  cursor: TokenCursor,
  context: ParseContext,
  closingType?: string,
): BlockNode[] {
  const blocks: BlockNode[] = [];
  while (cursor.position < tokens.length) {
    const token = tokens[cursor.position++];
    if (token.type === closingType) {
      break;
    }
    const range = sourceRange(token, context);
    let block: BlockNode | undefined;
    switch (token.type) {
      case 'heading_open':
        block = {
          type: 'heading',
          level: Number(token.tag.slice(1)),
          children: inlineChildren(tokens[cursor.position++]),
        };
        cursor.position++;
        break;
      case 'paragraph_open':
        block = {
          type: 'paragraph',
          children: inlineChildren(tokens[cursor.position++]),
        };
        cursor.position++;
        break;
      case 'fence':
      case 'code_block':
        block = {
          type: 'code',
          value: token.content.replace(/\n$/, ''),
          language: token.info.trim(),
        };
        break;
      case 'bullet_list_open':
      case 'ordered_list_open':
        block = parseList(tokens, cursor, token, context);
        break;
      case 'blockquote_open':
        block = parseQuote(tokens, cursor, context);
        break;
      case 'table_open':
        block = parseTable(tokens, cursor);
        break;
      case 'hr':
        block = { type: 'thematicBreak' };
        break;
      case 'otw_math_block':
        block = { type: 'math', value: token.content };
        break;
      case 'otw_footnote_definition': {
        const nestedTokens = context.markdown.parse(
          token.content,
          context.environment,
        );
        const nestedContext = {
          ...context,
          source: token.content,
          lineOffsets: [],
        };
        const children = collectBlocks(
          nestedTokens,
          { position: 0 },
          nestedContext,
        );
        removeRanges(children);
        block = {
          type: 'footnoteDefinition',
          identifier: String(token.meta.identifier),
          children,
        };
        break;
      }
      case 'html_block':
      case 'otw_frontmatter':
      case 'otw_comment_block': {
        const useOriginalSource = range !== undefined && token.level === 0;
        const value = useOriginalSource
          ? context.source.slice(range.start, range.end).replace(/\r?\n$/, '')
          : token.content.replace(/\n$/, '');
        const preserved = decodePreservedSource(value.trim());
        const staticInline =
          token.type === 'html_block'
            ? parseStaticHtmlInline(value)
            : undefined;
        const initialComment = /^<!--otw:v1:[\s\S]*?-->/.exec(value);
        const startsPreservation =
          token.type === 'html_block' &&
          initialComment !== null &&
          decodePreservedSource(initialComment[0]) !== undefined;
        if (preserved) {
          block = { type: 'raw', ...preserved };
        } else if (staticInline) {
          block = { type: 'paragraph', children: staticInline };
        } else if (startsPreservation) {
          const inlineTokens: Token[] = [];
          context.markdown.inline.parse(
            value,
            context.markdown,
            context.environment,
            inlineTokens,
          );
          block = {
            type: 'paragraph',
            children: collectInlineNodes(inlineTokens, { position: 0 }),
          };
        } else {
          const htmlReason = /^\s*<iframe\b/i.test(value)
            ? 'Obsidian iframe embed'
            : 'HTML block';
          block = {
            type: 'raw',
            value,
            dialect: 'obsidian',
            reason:
              token.type === 'otw_frontmatter'
                ? 'YAML front matter'
                : token.type === 'otw_comment_block'
                  ? 'Obsidian comment'
                  : htmlReason,
          };
        }
        break;
      }
      default:
        if (token.nesting === -1) {
          break;
        }
        block = {
          type: 'raw',
          value: range
            ? context.source.slice(range.start, range.end)
            : token.content,
          dialect: 'obsidian',
          reason: `Markdown block token ${token.type}`,
        };
    }
    if (block) {
      if (range) {
        block.range = range;
      }
      blocks.push(block);
    }
  }
  return blocks;
}

function removeRanges(blocks: BlockNode[]): void {
  for (const block of blocks) {
    delete block.range;
    if (block.type === 'quote' || block.type === 'footnoteDefinition') {
      removeRanges(block.children);
    }
    if (block.type === 'list') {
      for (const entry of block.children) {
        delete entry.range;
        removeRanges(entry.blocks);
      }
    }
  }
}

function recordPreservedSyntaxDiagnostic(
  node: InlineNode | BlockNode,
  context: ParseContext,
  range: SourceRange,
): void {
  if (node.type !== 'raw' || node.dialect !== 'obsidian') {
    return;
  }
  const categories: Record<string, { code: string; message: string }> = {
    'Obsidian inline footnote': {
      code: 'PRESERVED_INLINE_FOOTNOTE',
      message: 'Inline footnote is retained in its original Obsidian syntax.',
    },
    'Obsidian web embed': {
      code: 'PRESERVED_WEB_EMBED',
      message: 'Web embed is retained in its Obsidian source representation.',
    },
    'Obsidian iframe embed': {
      code: 'PRESERVED_IFRAME_EMBED',
      message: 'Iframe embed is retained in its original HTML syntax.',
    },
  };
  const diagnostic = categories[node.reason];
  if (diagnostic) {
    context.diagnostics.push({ ...diagnostic, severity: 'warning', range });
  }
}

function collectInlinePreservationDiagnostics(
  nodes: InlineNode[],
  context: ParseContext,
  range: SourceRange,
): void {
  for (const node of nodes) {
    if ('children' in node) {
      collectInlinePreservationDiagnostics(node.children, context, range);
    }
    if (node.type === 'link') {
      collectInlinePreservationDiagnostics(node.label, context, range);
    }
    recordPreservedSyntaxDiagnostic(node, context, range);
  }
}

function collectPreservationDiagnostics(
  blocks: BlockNode[],
  context: ParseContext,
  parentRange?: SourceRange,
): void {
  for (const block of blocks) {
    const range = block.range ??
      parentRange ?? { start: 0, end: context.source.length };
    recordPreservedSyntaxDiagnostic(block, context, range);
    if (block.type === 'paragraph' || block.type === 'heading') {
      collectInlinePreservationDiagnostics(block.children, context, range);
    }
    if (block.type === 'quote') {
      collectInlinePreservationDiagnostics(
        block.callout?.titleNodes ?? [],
        context,
        range,
      );
      collectPreservationDiagnostics(block.children, context, range);
    }
    if (block.type === 'footnoteDefinition') {
      collectPreservationDiagnostics(block.children, context, range);
    }
    if (block.type === 'list') {
      for (const entry of block.children) {
        collectPreservationDiagnostics(entry.blocks, context, range);
      }
    }
    if (block.type === 'table') {
      for (const cell of block.header) {
        collectInlinePreservationDiagnostics(cell, context, range);
      }
      for (const tableRow of block.rows) {
        for (const cell of tableRow) {
          collectInlinePreservationDiagnostics(cell, context, range);
        }
      }
    }
  }
}

export function parseObsidian(source: string): ParsedDocument {
  const markdown = createObsidianParser();
  const lineOffsets = [0];
  for (let position = 0; position < source.length; position++) {
    if (source[position] === '\n') {
      lineOffsets.push(position + 1);
    }
  }
  const diagnostics: ConversionDiagnostic[] = [];
  const environment = {};
  const context: ParseContext = {
    source,
    lineOffsets,
    diagnostics,
    markdown,
    environment,
  };
  const markdownTokens = markdown.parse(source, environment);
  const blocks = collectBlocks(markdownTokens, { position: 0 }, context);
  collectPreservationDiagnostics(blocks, context);
  return {
    dialect: 'obsidian',
    source,
    blocks,
    tokens: lexSource(source, 'obsidian'),
    diagnostics,
  };
}
