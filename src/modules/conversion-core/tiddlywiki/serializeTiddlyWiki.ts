import { BlockNode } from '../types/BlockNode';
import { ConversionDiagnostic } from '../types/ConversionDiagnostic';
import { ConversionOptions } from '../types/ConversionOptions';
import { InlineNode } from '../types/InlineNode';
import { ParsedDocument } from '../types/ParsedDocument';
import { SerializationResult } from '../types/SerializationResult';
import { encodePreservedSource } from '../preservation/encodePreservedSource';
import { serializeObsidian } from '../markdown/serializeObsidian';

type RangedNode = BlockNode | InlineNode;

/** Serialize the shared semantics as TW5 source, keeping foreign regions recoverable. */
export function serializeTiddlyWiki(
  document: ParsedDocument,
  options: ConversionOptions = {},
): SerializationResult {
  const serializer = new TiddlyWikiSerializer(document, options);
  return {
    text: serializer.serializeBlocks(document.blocks),
    diagnostics: serializer.diagnostics,
  };
}

class TiddlyWikiSerializer {
  readonly diagnostics: ConversionDiagnostic[] = [];

  constructor(
    private readonly document: ParsedDocument,
    private readonly options: ConversionOptions,
  ) {}

  private diagnose(node: RangedNode, code: string, message: string): void {
    this.diagnostics.push({
      code,
      message,
      severity: 'warning',
      range: node.range ?? { start: 0, end: this.document.source.length },
    });
  }

  private preserve(node: RangedNode, reason: string, block = false): string {
    this.diagnose(node, 'tw-preserved-foreign-source', reason);
    const blocks: BlockNode[] = block
      ? [node as BlockNode]
      : [{ type: 'paragraph', children: [node as InlineNode] }];
    const fragment: ParsedDocument = { ...this.document, blocks };
    const value = node.range
      ? this.document.source.slice(node.range.start, node.range.end)
      : serializeObsidian(fragment).text;
    return encodePreservedSource({
      dialect: this.document.dialect,
      value,
      reason,
    });
  }

  private serializeRaw(
    node: Extract<BlockNode | InlineNode, { type: 'raw' }>,
  ): string {
    if (node.dialect === 'tiddlywiki') {
      return node.value;
    }
    this.diagnose(node, 'tw-preserved-foreign-source', node.reason);
    return encodePreservedSource({
      dialect: node.dialect,
      value: node.value,
      reason: node.reason,
    });
  }

  serializeBlocks(blocks: BlockNode[]): string {
    return blocks.map((block) => this.serializeBlock(block)).join('\n\n');
  }

  private serializeBlock(block: BlockNode): string {
    switch (block.type) {
      case 'paragraph':
        return this.serializeInline(block.children);
      case 'heading':
        return (
          '!'.repeat(Math.max(1, Math.min(6, block.level))) +
          ' ' +
          this.serializeInline(block.children)
        );
      case 'thematicBreak':
        return '---';
      case 'code': {
        const needsHtml =
          /^```$/m.test(block.value) || !/^[\w-]*$/.test(block.language);
        if (needsHtml) {
          this.diagnose(
            block,
            'tw-html-code',
            'The code uses an HTML representation because TW code fences cannot contain this delimiter or language identifier.',
          );
          const languageAttribute = quoteWidgetAttribute(
            'language-' + block.language,
          );
          if (!languageAttribute) {
            return this.preserve(
              block,
              'The code language uses an unsupported attribute delimiter.',
              true,
            );
          }
          const language = block.language ? ` class=${languageAttribute}` : '';
          return `<pre><code${language}>${escapeText(block.value)}</code></pre>`;
        }
        return '```' + block.language + '\n' + block.value + '\n```';
      }
      case 'quote': {
        if (block.callout) {
          this.diagnose(
            block,
            'tw-html-callout',
            'The callout is represented as a static HTML aside.',
          );
          const title = block.callout.title || block.callout.type;
          const typeAttribute = quoteWidgetAttribute(block.callout.type);
          const titleAttribute = quoteWidgetAttribute(block.callout.title);
          if (!typeAttribute || !titleAttribute) {
            return this.preserve(
              block,
              'The callout title uses an unsupported attribute delimiter.',
              true,
            );
          }
          const fold = block.callout.fold
            ? ` data-callout-fold="${block.callout.fold}"`
            : '';
          const renderedTitle = block.callout.titleNodes
            ? this.serializeInline(block.callout.titleNodes)
            : escapeText(title);
          return `<aside class="callout" data-callout=${typeAttribute} data-callout-title=${titleAttribute}${fold}>\n\n<strong>${renderedTitle}</strong>\n\n${this.serializeBlocks(block.children)}\n\n</aside>`;
        }
        const originalLineQuotes =
          this.document.dialect === 'tiddlywiki' &&
          block.range &&
          /^\s*>/.test(
            this.document.source.slice(block.range.start, block.range.end),
          );
        if (originalLineQuotes && this.isLineQuote(block)) {
          return this.serializeLineQuote(block, '');
        }
        const contents = this.serializeBlocks(block.children);
        const longestMarker = Math.max(
          2,
          ...Array.from(
            contents.matchAll(/^\s*(<{3,})/gm),
            (match) => match[1].length,
          ),
        );
        const fence = '<'.repeat(longestMarker + 1);
        return fence + '\n' + contents + '\n' + fence;
      }
      case 'list': {
        const simpleList = this.isSimpleList(block);
        if (simpleList) {
          return this.serializeList(block, '');
        }
        this.diagnose(
          block,
          'tw-html-list',
          'The list uses HTML to preserve continuation blocks, task state or its starting number.',
        );
        return this.serializeHtmlList(block);
      }
      case 'table': {
        const serializeCell = (
          children: InlineNode[],
          column: number,
          header: boolean,
        ) => {
          const content = (header ? '!' : '') + this.serializeInline(children);
          const alignment = block.alignments[column];
          if (alignment === 'left') {
            return content + ' ';
          }
          if (alignment === 'right') {
            return ' ' + content;
          }
          if (alignment === 'center') {
            return ' ' + content + ' ';
          }
          return content;
        };
        const header =
          '|' +
          block.header
            .map((cell, column) => serializeCell(cell, column, true))
            .join('|') +
          '|';
        const body = block.rows.map(
          (row) =>
            '|' +
            row
              .map((cell, column) => serializeCell(cell, column, false))
              .join('|') +
            '|',
        );
        return [header, ...body].join('\n');
      }
      case 'math':
        return this.preserve(
          block,
          'Math requires a compatible TiddlyWiki rendering plugin; the original source is retained.',
          true,
        );
      case 'footnoteDefinition': {
        const id = encodeURIComponent(block.identifier);
        return `<div id="footnote-${id}">\n\n<sup>${escapeText(block.identifier)}</sup> ${this.serializeBlocks(block.children)}\n\n</div>`;
      }
      case 'raw':
        return this.serializeRaw(block);
    }
  }

  private isSimpleList(block: Extract<BlockNode, { type: 'list' }>): boolean {
    if (block.ordered && block.start !== 1) {
      return false;
    }
    return block.children.every((entry) => {
      if (entry.checked !== undefined) {
        return false;
      }
      const [first, ...remaining] = entry.blocks;
      if (!first || first.type !== 'paragraph') {
        return false;
      }
      const multilineFirst = first.children.some(
        (child) =>
          child.type === 'break' ||
          (child.type === 'text' && /[\r\n]/.test(child.value)),
      );
      if (multilineFirst) {
        return false;
      }
      return remaining.every(
        (child) => child.type === 'list' && this.isSimpleList(child),
      );
    });
  }

  private isLineQuote(block: Extract<BlockNode, { type: 'quote' }>): boolean {
    return block.children.every((child) => {
      if (child.type === 'quote') {
        return !child.callout && this.isLineQuote(child);
      }
      if (child.type !== 'paragraph') {
        return false;
      }
      return child.children.every((inline) => inline.type !== 'break');
    });
  }

  private serializeLineQuote(
    block: Extract<BlockNode, { type: 'quote' }>,
    prefix: string,
  ): string {
    const quotePrefix = prefix + '>';
    return block.children
      .map((child) => {
        if (child.type === 'quote') {
          return this.serializeLineQuote(child, quotePrefix);
        }
        if (child.type === 'paragraph') {
          return quotePrefix + ' ' + this.serializeInline(child.children);
        }
        return '';
      })
      .join('\n');
  }

  private serializeList(
    block: Extract<BlockNode, { type: 'list' }>,
    parentPrefix: string,
  ): string {
    const prefix = parentPrefix + (block.ordered ? '#' : '*');
    const renderedEntries: string[] = [];
    for (const entry of block.children) {
      const [first, ...nestedLists] = entry.blocks;
      const contents =
        first?.type === 'paragraph' ? this.serializeInline(first.children) : '';
      renderedEntries.push(prefix + ' ' + contents);
      for (const nested of nestedLists) {
        if (nested.type === 'list') {
          renderedEntries.push(this.serializeList(nested, prefix));
        }
      }
    }
    return renderedEntries.join('\n');
  }

  private serializeHtmlList(
    block: Extract<BlockNode, { type: 'list' }>,
  ): string {
    const tag = block.ordered ? 'ol' : 'ul';
    const startAttribute =
      block.ordered && block.start !== 1 ? ` start="${block.start}"` : '';
    const entries = block.children.map((entry) => {
      const marker =
        entry.taskMarker === undefined
          ? ''
          : ' data-task-marker=' + quoteWidgetAttribute(entry.taskMarker);
      const checkbox =
        entry.checked === undefined
          ? ''
          : `<input type="checkbox" disabled${entry.checked ? ' checked' : ''}${marker}/> `;
      return (
        '<li>\n\n' + checkbox + this.serializeBlocks(entry.blocks) + '\n\n</li>'
      );
    });
    return (
      `<${tag}${startAttribute}>\n\n` + entries.join('\n\n') + `\n\n</${tag}>`
    );
  }

  private serializeInline(children: InlineNode[]): string {
    return children.map((child) => this.serializeInlineNode(child)).join('');
  }

  private serializeInlineNode(node: InlineNode): string {
    switch (node.type) {
      case 'text':
        return escapeText(node.value);
      case 'break':
        return node.hard ? '<br>' : '\n';
      case 'code': {
        if (!node.value.includes('`')) {
          return '`' + node.value + '`';
        }
        if (!node.value.includes('``')) {
          return '``' + node.value + '``';
        }
        return '<code>' + escapeText(node.value) + '</code>';
      }
      case 'strong':
        return "''" + this.serializeInline(node.children) + "''";
      case 'emphasis':
        return '//' + this.serializeInline(node.children) + '//';
      case 'underline':
        return '__' + this.serializeInline(node.children) + '__';
      case 'strike':
        return '~~' + this.serializeInline(node.children) + '~~';
      case 'highlight': {
        const nativeHighlight =
          this.document.dialect === 'tiddlywiki' &&
          node.range &&
          this.document.source.startsWith('@@', node.range.start);
        if (nativeHighlight) {
          return '@@' + this.serializeInline(node.children) + '@@';
        }
        return '<mark>' + this.serializeInline(node.children) + '</mark>';
      }
      case 'superscript':
        return '^^' + this.serializeInline(node.children) + '^^';
      case 'subscript':
        return ',,' + this.serializeInline(node.children) + ',,';
      case 'link': {
        const target =
          !node.external && this.options.resolveLink
            ? this.options.resolveLink(node.target, 'link')
            : node.target;
        const textLabel = node.label.every((child) => child.type === 'text');
        const label = textLabel
          ? node.label
              .map((child) => (child.type === 'text' ? child.value : ''))
              .join('')
          : '';
        const needsWidget =
          !textLabel ||
          /\]\]|[\r\n]/.test(target) ||
          /[|\r\n]|\]\]/.test(label) ||
          node.title !== undefined;
        if (needsWidget) {
          const attribute = quoteWidgetAttribute(target);
          if (!attribute) {
            return this.preserve(
              node,
              'The link target requires a quoting form outside the supported TW attribute subset.',
            );
          }
          if (node.external) {
            const titleAttribute =
              node.title === undefined
                ? undefined
                : quoteWidgetAttribute(node.title);
            if (node.title !== undefined && !titleAttribute) {
              return this.preserve(
                node,
                'The link title uses an unsupported attribute delimiter.',
              );
            }
            const title =
              titleAttribute === undefined ? '' : ` title=${titleAttribute}`;
            return `<a href=${attribute}${title}>${this.serializeInline(node.label)}</a>`;
          }
          const tooltipAttribute =
            node.title === undefined
              ? undefined
              : quoteWidgetAttribute(node.title);
          if (node.title !== undefined && !tooltipAttribute) {
            return this.preserve(
              node,
              'The link title uses an unsupported attribute delimiter.',
            );
          }
          const tooltip =
            tooltipAttribute === undefined
              ? ''
              : ' tooltip=' + tooltipAttribute;
          return `<$link to=${attribute}${tooltip}>${this.serializeInline(node.label)}</$link>`;
        }
        const prefix = node.external ? '[ext[' : '[[';
        return (
          prefix + (label === target ? target : label + '|' + target) + ']]'
        );
      }
      case 'embed': {
        const externalTarget = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.target);
        const target =
          !externalTarget && this.options.resolveLink
            ? this.options.resolveLink(node.target, 'embed')
            : node.target;
        if (node.kind === 'note') {
          const needsPreservation = /[{}|!#]/.test(target);
          if (needsPreservation) {
            return this.preserve(
              node,
              'The note embed needs block, heading or field mapping before conversion.',
            );
          }
          return '{{' + target + '}}';
        }
        const needsWidget =
          /[\]|\r\n]/.test(target) || /[\]|\r\n]/.test(node.title ?? '');
        const altAttribute = quoteWidgetAttribute(node.alt);
        if (!altAttribute) {
          return this.preserve(
            node,
            'The alternative image text uses an unsupported attribute delimiter.',
          );
        }
        const includeAlt =
          node.alt.length > 0 || this.document.dialect === 'obsidian';
        if (needsWidget) {
          const sourceAttribute = quoteWidgetAttribute(target);
          const tooltipAttribute = quoteWidgetAttribute(node.title ?? '');
          if (!sourceAttribute || !tooltipAttribute) {
            return this.preserve(
              node,
              'The image attributes require an unsupported quoting form.',
            );
          }
          let attributes = ` source=${sourceAttribute} tooltip=${tooltipAttribute}`;
          if (includeAlt) {
            attributes += ' alt=' + altAttribute;
          }
          if (node.width) {
            attributes += ' width=' + quoteWidgetAttribute(node.width);
          }
          if (node.height) {
            attributes += ' height=' + quoteWidgetAttribute(node.height);
          }
          return '<$image' + attributes + '/>';
        }
        let attributes = '';
        if (includeAlt) {
          attributes += ' alt=' + altAttribute;
        }
        if (node.title === '') {
          attributes += ' tooltip=""';
        }
        if (node.width) {
          attributes += ' width=' + quoteWidgetAttribute(node.width);
        }
        if (node.height) {
          attributes += ' height=' + quoteWidgetAttribute(node.height);
        }
        return (
          '[img' +
          attributes +
          '[' +
          (node.title ? node.title + '|' : '') +
          target +
          ']]'
        );
      }
      case 'math':
        return this.preserve(
          node,
          'Math requires a compatible TiddlyWiki rendering plugin; the original source is retained.',
        );
      case 'footnoteReference':
        return `<sup><a href="#footnote-${encodeURIComponent(node.identifier)}">${escapeText(node.identifier)}</a></sup>`;
      case 'raw':
        return this.serializeRaw(node);
    }
  }
}

function quoteWidgetAttribute(value: string): string | undefined {
  if (!value.includes('"')) {
    return '"' + value + '"';
  }
  if (!value.includes("'")) {
    return "'" + value + "'";
  }
  if (!value.includes('"""')) {
    return '"""' + value + '"""';
  }
  return undefined;
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(
      /[<>[\]{}|`]/g,
      (character) => '&#' + character.charCodeAt(0) + ';',
    )
    .replace(
      /['/_~^,@$:]/g,
      (character) => '&#' + character.charCodeAt(0) + ';',
    )
    .replace(/-{2,}/g, (dashes) => Array.from(dashes, () => '&#45;').join(''))
    .replace(
      /(^|\n)([!*#;:>-])/g,
      (_, boundary: string, marker: string) =>
        boundary + '&#' + marker.charCodeAt(0) + ';',
    )
    .replace(/\b([A-Z][a-z]+[A-Z][A-Za-z]*)\b/g, '~$1');
}
