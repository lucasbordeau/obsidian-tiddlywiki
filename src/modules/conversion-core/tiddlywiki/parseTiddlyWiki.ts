import { BlockNode } from '../types/BlockNode';
import { ConversionDiagnostic } from '../types/ConversionDiagnostic';
import { InlineNode } from '../types/InlineNode';
import { ListItem } from '../types/ListItem';
import { ParsedDocument } from '../types/ParsedDocument';
import { SourceRange } from '../types/SourceRange';
import { decodePreservedSource } from '../preservation/decodePreservedSource';
import { lexSource } from '../lexer/lexSource';
import { decodeHTML } from 'entities';

type SourceLine = { text: string; start: number; end: number; next: number };
type ListBlock = Extract<BlockNode, { type: 'list' }>;
type FormattingType =
  | 'strong'
  | 'emphasis'
  | 'underline'
  | 'strike'
  | 'highlight'
  | 'superscript'
  | 'subscript';
type InlineMatch = { node: InlineNode; end: number };

const formattingMarkers: [string, FormattingType][] = [
  ["''", 'strong'],
  ['//', 'emphasis'],
  ['__', 'underline'],
  ['~~', 'strike'],
  ['^^', 'superscript'],
  [',,', 'subscript'],
  ['@@', 'highlight'],
];

const externalProtocol =
  /^(?:file|https?|mailto|ftp|irc|news|obsidian|data|skype):[^\s<>{}[\]`|"\\^]+(?:\/|\b)/i;
const bareExternalLink =
  /^(?:file|https?|mailto|ftp|irc|news|data|skype):[^\s<>{}[\]`|"\\^]+(?:\/|\b)/;
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** Parse the documented TW5 dialect without evaluating wiki modules or widgets. */
export function parseTiddlyWiki(source: string): ParsedDocument {
  const parser = new TiddlyWikiParser(source);
  return {
    dialect: 'tiddlywiki',
    source,
    blocks: parser.parseBlocks(0, parser.lines.length),
    tokens: lexSource(source, 'tiddlywiki'),
    diagnostics: parser.diagnostics,
  };
}

class TiddlyWikiParser {
  readonly lines: SourceLine[] = [];
  readonly diagnostics: ConversionDiagnostic[] = [];

  constructor(private readonly source: string) {
    let offset = 0;
    for (const segment of source.split(/(?<=\n)/)) {
      if (!segment) {
        continue;
      }
      const text = segment.replace(/\r?\n$/, '');
      this.lines.push({
        text,
        start: offset,
        end: offset + text.length,
        next: offset + segment.length,
      });
      offset += segment.length;
    }
  }

  private warn(code: string, message: string, range: SourceRange): void {
    this.diagnostics.push({ code, message, severity: 'warning', range });
  }

  private rawBlock(start: number, end: number, reason: string): BlockNode {
    const range = { start, end };
    this.warn('tw-preserved-source', reason, range);
    return {
      type: 'raw',
      value: this.source.slice(start, end),
      dialect: 'tiddlywiki',
      reason,
      range,
    };
  }

  private rawInline(start: number, end: number, reason: string): InlineNode {
    const range = { start, end };
    this.warn('tw-preserved-source', reason, range);
    return {
      type: 'raw',
      value: this.source.slice(start, end),
      dialect: 'tiddlywiki',
      reason,
      range,
    };
  }

  parseBlocks(firstLine: number, endLine: number): BlockNode[] {
    const leadingPragma =
      firstLine === 0 &&
      /^(?:\s|<!--[\s\S]*?-->)*\\(?:define|procedure|function|widget|rules|parameters|import|whitespace|parsermode)\b/.test(
        this.source,
      );
    if (leadingPragma) {
      return [
        this.rawBlock(
          0,
          this.source.length,
          'A TiddlyWiki pragma changes the surrounding syntax or wiki context.',
        ),
      ];
    }
    const blocks: BlockNode[] = [];
    let lineIndex = firstLine;
    while (lineIndex < endLine) {
      const line = this.lines[lineIndex];
      if (!line.text.trim()) {
        lineIndex++;
        continue;
      }
      const indentation = line.text.length - line.text.trimStart().length;
      const start = line.start + indentation;
      const text = line.text.slice(indentation);

      const isTypedBlock = /^\$\$\$[^\r\n]*$/.test(text);
      const isStyledBlock = /^@@(?:[^\s:]+:[^;\r\n]+;)*(?:\.[^\s]+)?$/.test(
        text,
      );
      if (isTypedBlock || isStyledBlock) {
        const marker = isTypedBlock ? '$$$' : '@@';
        let closingLine = lineIndex + 1;
        while (closingLine < endLine) {
          const foundClosingMarker = this.lines[closingLine].text === marker;
          if (foundClosingMarker) {
            break;
          }
          closingLine++;
        }
        const finalLine = Math.min(closingLine, endLine - 1);
        blocks.push(
          this.rawBlock(
            start,
            this.lines[finalLine].end,
            isTypedBlock
              ? 'Typed blocks retain their source content type and renderer.'
              : 'Styled blocks retain their classes and CSS.',
          ),
        );
        lineIndex = closingLine < endLine ? closingLine + 1 : endLine;
        continue;
      }

      if (/^<%\s*if\s/.test(text)) {
        const final = this.findConditionalEnd(
          start,
          this.lines[endLine - 1].end,
        );
        blocks.push(
          this.rawBlock(
            start,
            final,
            'Conditional branches require a TiddlyWiki evaluation context.',
          ),
        );
        while (lineIndex < endLine && this.lines[lineIndex].end <= final) {
          lineIndex++;
        }
        const remaining = this.lines[lineIndex];
        if (remaining && remaining.start < final) {
          blocks.push({
            type: 'paragraph',
            children: this.parseInline(final, remaining.end),
            range: { start: final, end: remaining.end },
          });
          lineIndex++;
        }
        continue;
      }

      const capsule = decodePreservedSource(text);
      if (capsule) {
        blocks.push({
          type: 'raw',
          ...capsule,
          range: { start, end: line.end },
        });
        lineIndex++;
        continue;
      }

      const fence = /^```([\w-]*)$/.exec(text);
      if (fence) {
        let closingLine = lineIndex + 2;
        while (closingLine < endLine) {
          const foundCodeFence = this.lines[closingLine].text === '```';
          if (foundCodeFence) {
            break;
          }
          closingLine++;
        }
        const closed = closingLine < endLine;
        const bodyStart = line.next;
        let bodyEnd = closed
          ? this.lines[closingLine].start
          : this.lines[endLine - 1].next;
        if (closed && bodyEnd > bodyStart) {
          bodyEnd -= this.source[bodyEnd - 2] === '\r' ? 2 : 1;
        }
        const end = closed
          ? this.lines[closingLine].end
          : this.lines[endLine - 1].end;
        blocks.push({
          type: 'code',
          value: this.source.slice(bodyStart, bodyEnd),
          language: fence[1],
          range: { start, end },
        });
        if (!closed) {
          this.warn(
            'tw-unclosed-code',
            'The code block continues to the end of the source.',
            { start, end },
          );
        }
        lineIndex = closed ? closingLine + 1 : endLine;
        continue;
      }

      const quoteFence = /^(<{3,})(.*)$/.exec(text);
      if (quoteFence) {
        let closingLine = lineIndex + 1;
        const closePattern = new RegExp('^\\s*' + quoteFence[1] + '(?!<)(.*)$');
        while (closingLine < endLine) {
          const candidate = this.lines[closingLine];
          const foundQuoteClosingMarker = closePattern.test(candidate.text);
          if (foundQuoteClosingMarker) {
            break;
          }
          const protectedCodeFence = /^\s*```[\w-]*$/.test(candidate.text);
          if (protectedCodeFence) {
            closingLine += 2;
            while (closingLine < endLine) {
              const foundCodeClosingMarker =
                this.lines[closingLine].text === '```';
              if (foundCodeClosingMarker) {
                break;
              }
              closingLine++;
            }
          }
          closingLine++;
        }
        const closed = closingLine < endLine;
        const end = closed
          ? this.lines[closingLine].end
          : this.lines[endLine - 1].end;
        const closingSuffix = closed
          ? closePattern.exec(this.lines[closingLine].text)?.[1].trim()
          : '';
        const hasQuoteDecoration = Boolean(
          quoteFence[2].trim() || closingSuffix,
        );
        if (hasQuoteDecoration) {
          blocks.push(
            this.rawBlock(
              start,
              end,
              'Quote citations and CSS classes are retained in their original syntax.',
            ),
          );
        } else {
          blocks.push({
            type: 'quote',
            children: this.parseBlocks(lineIndex + 1, closingLine),
            range: { start, end },
          });
        }
        if (!closed) {
          this.warn(
            'tw-unclosed-quote',
            'The quote continues to the end of the source.',
            { start, end },
          );
        }
        lineIndex = closed ? closingLine + 1 : endLine;
        continue;
      }

      const heading = /^(!{1,6})(.*)$/.exec(text);
      if (heading) {
        if (/^\.[\w-]/.test(heading[2])) {
          blocks.push(
            this.rawBlock(
              start,
              line.end,
              'The heading has TiddlyWiki CSS classes.',
            ),
          );
        } else {
          const content = heading[2].trimStart();
          blocks.push({
            type: 'heading',
            level: heading[1].length,
            children: this.parseInline(line.end - content.length, line.end),
            range: { start, end: line.end },
          });
        }
        lineIndex++;
        continue;
      }

      if (/^-{3,}\s*$/.test(text)) {
        blocks.push({ type: 'thematicBreak', range: { start, end: line.end } });
        lineIndex++;
        continue;
      }

      if (/^[*#;:>]/.test(text)) {
        let listEnd = lineIndex + 1;
        while (listEnd < endLine) {
          const nextLineIsList = /^\s*[*#;:>]/.test(this.lines[listEnd].text);
          if (!nextLineIsList) {
            break;
          }
          listEnd++;
        }
        const listLines = this.lines.slice(lineIndex, listEnd);
        const hasSpecialList = listLines.some((listLine) =>
          /^\s*[*#;:>]*[;:]|^\s*[*#;:>]+\.[\w-]|^\s*[*#]+>/.test(listLine.text),
        );
        if (hasSpecialList) {
          blocks.push(
            this.rawBlock(
              start,
              this.lines[listEnd - 1].end,
              'Definition lists, styled list entries and mixed list/quote prefixes retain their original syntax.',
            ),
          );
        } else if (text[0] === '>') {
          let quoteEnd = lineIndex + 1;
          while (quoteEnd < listEnd) {
            const nextLineIsQuote = /^\s*>/.test(this.lines[quoteEnd].text);
            if (!nextLineIsQuote) {
              break;
            }
            quoteEnd++;
          }
          blocks.push(...this.parseLineQuotes(lineIndex, quoteEnd));
          lineIndex = quoteEnd;
          continue;
        } else {
          blocks.push(...this.parseLists(lineIndex, listEnd));
        }
        lineIndex = listEnd;
        continue;
      }

      if (text.startsWith('|')) {
        let tableEnd = lineIndex + 1;
        while (tableEnd < endLine && /^\s*\|/.test(this.lines[tableEnd].text)) {
          tableEnd++;
        }
        blocks.push(this.parseTable(lineIndex, tableEnd));
        lineIndex = tableEnd;
        continue;
      }

      const blockHtml =
        /^<(?:div|pre|ul|ol|table|blockquote|aside|section|article|\$[\w-]+)(?=[\s/>])/i.test(
          text,
        );
      const staticInlineWidget = /^<\$(?:link|image)(?=[\s/>])/i.test(text);
      if (blockHtml && !staticInlineWidget) {
        const opaqueEnd = this.findHtmlEnd(start, this.lines[endLine - 1].end);
        if (opaqueEnd > start) {
          const staticBlock = this.parseStaticHtmlBlock(start, opaqueEnd);
          blocks.push(
            staticBlock ??
              this.rawBlock(
                start,
                opaqueEnd,
                'HTML and widgets are preserved without execution.',
              ),
          );
          while (lineIndex < endLine) {
            const lineWithinHtml = this.lines[lineIndex].end <= opaqueEnd;
            if (!lineWithinHtml) {
              break;
            }
            lineIndex++;
          }
          const remainingLine = this.lines[lineIndex];
          const hasInlineRemainder =
            remainingLine && remainingLine.start < opaqueEnd;
          if (hasInlineRemainder) {
            blocks.push({
              type: 'paragraph',
              children: this.parseInline(opaqueEnd, remainingLine.end),
              range: { start: opaqueEnd, end: remainingLine.end },
            });
            lineIndex++;
          }
          continue;
        }
      }

      const end = this.findParagraphEnd(start, this.lines[endLine - 1].end);
      blocks.push({
        type: 'paragraph',
        children: this.parseInline(start, end),
        range: { start, end },
      });
      while (lineIndex < endLine && this.lines[lineIndex].end <= end) {
        lineIndex++;
      }
    }
    return blocks;
  }

  private parseLineQuotes(firstLine: number, endLine: number): BlockNode[] {
    const quoteBlocks: BlockNode[] = [];
    const quoteStack: Extract<BlockNode, { type: 'quote' }>[] = [];
    for (let index = firstLine; index < endLine; index++) {
      const line = this.lines[index];
      const match = /^\s*(>+)[ \t]?(.*)$/.exec(line.text);
      if (!match) {
        continue;
      }
      const depth = match[1].length;
      quoteStack.length = Math.min(depth, quoteStack.length);
      while (quoteStack.length < depth) {
        const quote: Extract<BlockNode, { type: 'quote' }> = {
          type: 'quote',
          children: [],
          range: { start: line.start, end: line.end },
        };
        const parent = quoteStack[quoteStack.length - 1];
        if (parent) {
          parent.children.push(quote);
        } else {
          quoteBlocks.push(quote);
        }
        quoteStack.push(quote);
      }
      for (const quote of quoteStack) {
        if (quote.range) {
          quote.range.end = line.end;
        }
      }
      const contentStart = line.end - match[2].length;
      quoteStack[depth - 1].children.push({
        type: 'paragraph',
        children: this.parseInline(contentStart, line.end),
        range: { start: contentStart, end: line.end },
      });
    }
    return quoteBlocks;
  }

  private parseLists(firstLine: number, endLine: number): BlockNode[] {
    const listBlocks: BlockNode[] = [];
    const stack: { marker: string; block: ListBlock; lastItem?: ListItem }[] =
      [];
    for (let index = firstLine; index < endLine; index++) {
      const line = this.lines[index];
      const match = /^\s*([*#]+)[ \t]?(.*)$/.exec(line.text);
      if (!match) {
        listBlocks.push(
          this.rawBlock(
            line.start,
            line.end,
            'This list prefix needs a TiddlyWiki-specific representation.',
          ),
        );
        stack.length = 0;
        continue;
      }
      const markers = match[1];
      let commonDepth = 0;
      const matchingDepth = Math.min(markers.length, stack.length);
      while (commonDepth < matchingDepth) {
        const markerMatchesStack =
          markers[commonDepth] === stack[commonDepth].marker;
        if (!markerMatchesStack) {
          break;
        }
        commonDepth++;
      }
      stack.length = commonDepth;
      while (stack.length < markers.length) {
        const depth = stack.length;
        const marker = markers[depth];
        const block: ListBlock = {
          type: 'list',
          ordered: marker === '#',
          start: 1,
          children: [],
          range: { start: line.start, end: line.end },
        };
        const parent = stack[depth - 1];
        if (parent) {
          if (!parent.lastItem) {
            parent.lastItem = {
              blocks: [],
              range: { start: line.start, end: line.end },
            };
            parent.block.children.push(parent.lastItem);
          }
          parent.lastItem.blocks.push(block);
        } else {
          listBlocks.push(block);
        }
        stack.push({ marker, block });
      }
      const contentStart = line.end - match[2].length;
      const item: ListItem = {
        blocks: [
          {
            type: 'paragraph',
            children: this.parseInline(contentStart, line.end),
            range: { start: contentStart, end: line.end },
          },
        ],
        range: { start: line.start, end: line.end },
      };
      const current = stack[stack.length - 1];
      current.block.children.push(item);
      current.lastItem = item;
      for (const frame of stack) {
        if (frame.block.range) {
          frame.block.range.end = line.end;
        }
        if (frame.lastItem?.range) {
          frame.lastItem.range.end = line.end;
        }
      }
    }
    return listBlocks;
  }

  private parseTable(firstLine: number, endLine: number): BlockNode {
    const first = this.lines[firstLine];
    const last = this.lines[endLine - 1];
    const range = { start: first.start, end: last.end };
    const tableRows: InlineNode[][][] = [];
    const headerFlags: boolean[][] = [];
    let alignments: ('left' | 'right' | 'center' | null)[] = [];
    for (let index = firstLine; index < endLine; index++) {
      const line = this.lines[index];
      const text = line.text.trimStart();
      const suffix = /\|([a-z]?)\s*$/.exec(text);
      if (!suffix || /[ckfh]/.test(suffix[1])) {
        return this.rawBlock(
          range.start,
          range.end,
          'Table captions, classes, header groups and footer rows retain their original syntax.',
        );
      }
      const firstCellStart = line.start + line.text.indexOf('|') + 1;
      const finalSeparator = line.start + line.text.lastIndexOf('|');
      const cellRanges = this.splitTableCells(firstCellStart, finalSeparator);
      const row: InlineNode[][] = [];
      const flags: boolean[] = [];
      const rowAlignments: ('left' | 'right' | 'center' | null)[] = [];
      for (const cell of cellRanges) {
        const value = this.source.slice(cell.start, cell.end);
        const specialCell = /^(?:[<>~]|[\^,].*)$/.test(value.trim());
        if (specialCell) {
          return this.rawBlock(
            range.start,
            range.end,
            'Merged cells and vertical table alignment retain their original syntax.',
          );
        }
        const leftSpace = /^\s/.test(value);
        const rightSpace = /\s$/.test(value);
        rowAlignments.push(
          leftSpace
            ? rightSpace
              ? 'center'
              : 'right'
            : rightSpace
              ? 'left'
              : null,
        );
        let contentStart = cell.start + value.length - value.trimStart().length;
        const header = this.source[contentStart] === '!';
        if (this.source[contentStart] === '!') {
          contentStart++;
        }
        const contentEnd = cell.end - (value.length - value.trimEnd().length);
        flags.push(header);
        row.push(
          this.parseInline(contentStart, Math.max(contentStart, contentEnd)),
        );
      }
      if (index === firstLine) {
        alignments = rowAlignments;
      }
      const alignmentMismatch =
        index > firstLine &&
        rowAlignments.some(
          (alignment, column) => alignment !== alignments[column],
        );
      if (alignmentMismatch) {
        return this.rawBlock(
          range.start,
          range.end,
          'Per-cell table alignment differs between rows.',
        );
      }
      tableRows.push(row);
      headerFlags.push(flags);
    }
    const firstFlags = headerFlags[0] ?? [];
    const regularHeader = firstFlags.length > 0 && firstFlags.every(Boolean);
    const extraHeaders = headerFlags
      .slice(1)
      .some((flags) => flags.some(Boolean));
    const raggedRows = tableRows.some(
      (row) => row.length !== tableRows[0].length,
    );
    if (!regularHeader || extraHeaders || raggedRows) {
      return this.rawBlock(
        range.start,
        range.end,
        'Tables without one rectangular header row retain their original syntax.',
      );
    }
    return {
      type: 'table',
      header: tableRows[0],
      rows: tableRows.slice(1),
      alignments,
      range,
    };
  }

  private splitTableCells(start: number, end: number): SourceRange[] {
    const cells: SourceRange[] = [];
    let cellStart = start;
    let cursor = start;
    while (cursor < end) {
      const protectedEnd = this.findProtectedEnd(cursor, end);
      if (protectedEnd > cursor) {
        cursor = protectedEnd;
        continue;
      }
      if (this.source[cursor] === '|') {
        cells.push({ start: cellStart, end: cursor });
        cellStart = cursor + 1;
      }
      cursor++;
    }
    cells.push({ start: cellStart, end });
    return cells;
  }

  parseInline(start: number, end: number, depth = 0): InlineNode[] {
    if (depth > 100) {
      return [
        this.rawInline(start, end, 'The inline nesting limit was reached.'),
      ];
    }
    const children: InlineNode[] = [];
    let cursor = start;
    let textStart = start;
    const flushText = () => {
      if (textStart < cursor) {
        children.push({
          type: 'text',
          value: this.source.slice(textStart, cursor),
          range: { start: textStart, end: cursor },
        });
      }
    };
    while (cursor < end) {
      if (this.source.startsWith('"""', cursor)) {
        flushText();
        const opening = cursor;
        let contentStart = cursor + 3;
        if (this.source.startsWith('\r\n', contentStart)) {
          contentStart += 2;
        } else if (this.source[contentStart] === '\n') {
          contentStart++;
        }
        const closing = this.source.indexOf('"""', contentStart);
        const closed = closing >= 0 && closing + 3 <= end;
        const contentEnd = closed ? closing : end;
        const hardLineChildren = this.parseInline(
          contentStart,
          contentEnd,
          depth + 1,
        );
        for (const child of hardLineChildren) {
          if (child.type === 'break') {
            child.hard = true;
          }
        }
        children.push(...hardLineChildren);
        cursor = closed ? closing + 3 : end;
        textStart = cursor;
        if (!closed) {
          this.warn(
            'tw-unclosed-hardlinebreaks',
            'The hard-linebreak region continues to the end of the source.',
            { start: opening, end: cursor },
          );
        }
        continue;
      }
      const match = this.matchInline(cursor, end, depth);
      if (match) {
        flushText();
        children.push(match.node);
        cursor = match.end;
        textStart = cursor;
      } else {
        cursor++;
      }
    }
    flushText();
    return children;
  }

  private matchInline(
    start: number,
    end: number,
    depth: number,
  ): InlineMatch | undefined {
    const tail = this.source.slice(start, end);
    if (tail.startsWith('<!--')) {
      const closing = this.source.indexOf('-->', start + 4);
      const final = closing >= 0 && closing + 3 <= end ? closing + 3 : end;
      const capsule = decodePreservedSource(this.source.slice(start, final));
      if (capsule) {
        return {
          node: { type: 'raw', ...capsule, range: { start, end: final } },
          end: final,
        };
      }
      return {
        node: this.rawInline(
          start,
          final,
          'HTML comments retain their original source.',
        ),
        end: final,
      };
    }
    if (tail.startsWith('/%')) {
      const closing = this.source.indexOf('%/', start + 2);
      const final = closing >= 0 && closing + 2 <= end ? closing + 2 : end;
      return {
        node: this.rawInline(
          start,
          final,
          'TiddlyWiki comments retain their original source.',
        ),
        end: final,
      };
    }
    if (tail.startsWith('`')) {
      const delimiter = tail.startsWith('``') ? '``' : '`';
      const closing = this.source.indexOf(delimiter, start + delimiter.length);
      const closed = closing >= 0 && closing + delimiter.length <= end;
      const final = closed ? closing + delimiter.length : end;
      if (!closed) {
        this.warn(
          'tw-unclosed-inline-code',
          'Inline code continues to the end of the containing block.',
          { start, end: final },
        );
      }
      return {
        node: {
          type: 'code',
          value: this.source.slice(
            start + delimiter.length,
            closed ? closing : end,
          ),
          range: { start, end: final },
        },
        end: final,
      };
    }
    if (tail.startsWith('[[') || tail.startsWith('[ext[')) {
      const external = tail.startsWith('[ext[');
      const contentStart = start + (external ? 5 : 2);
      const closing = this.source.indexOf(']]', contentStart);
      const hasClosing = closing >= 0 && closing + 2 <= end;
      if (!hasClosing) {
        return {
          node: this.rawInline(start, end, 'The wiki link is unfinished.'),
          end,
        };
      }
      const value = this.source.slice(contentStart, closing);
      const separator = value.indexOf('|');
      const label = separator < 0 ? value : value.slice(0, separator);
      const target =
        separator < 0 ? value : value.slice(separator + 1) || label;
      const final = closing + 2;
      return {
        node: {
          type: 'link',
          target,
          label: [
            {
              type: 'text',
              value: label,
              range: { start: contentStart, end: contentStart + label.length },
            },
          ],
          external: external || externalProtocol.test(target),
          range: { start, end: final },
        },
        end: final,
      };
    }
    if (tail.startsWith('[img')) {
      return this.matchImage(start, end);
    }
    if (tail.startsWith('{{{')) {
      const closing = this.findDelimitedEnd(start, end, '{{{', '}}}');
      return {
        node: this.rawInline(
          start,
          closing,
          'Filtered transclusions require a TiddlyWiki evaluation context.',
        ),
        end: closing,
      };
    }
    if (tail.startsWith('{{')) {
      const final = this.findDelimitedEnd(start, end, '{{', '}}');
      const closed = this.source.slice(final - 2, final) === '}}';
      const target = this.source.slice(start + 2, closed ? final - 2 : final);
      const simpleReference =
        closed &&
        target.length > 0 &&
        !/[|!{}]/.test(target) &&
        !target.includes('##');
      const node: InlineNode = simpleReference
        ? {
            type: 'embed',
            target,
            alt: '',
            kind: 'note',
            range: { start, end: final },
          }
        : this.rawInline(
            start,
            final,
            'Field and template transclusions require a TiddlyWiki evaluation context.',
          );
      return { node, end: final };
    }
    const macroClosingOffset = this.source.indexOf('>>', start + 2);
    const macroHasClosingDelimiter =
      tail.startsWith('<<') &&
      macroClosingOffset < end &&
      macroClosingOffset >= 0;
    if (macroHasClosingDelimiter) {
      const final = this.findDelimitedEnd(start, end, '<<', '>>');
      return {
        node: this.rawInline(
          start,
          final,
          'Macro calls require a TiddlyWiki evaluation context.',
        ),
        end: final,
      };
    }
    if (tail.startsWith('<<')) {
      return {
        node: { type: 'text', value: '<<', range: { start, end: start + 2 } },
        end: start + 2,
      };
    }
    if (tail.startsWith('<')) {
      const final = this.findHtmlEnd(start, end);
      if (final > start) {
        const staticNode = this.parseStaticHtmlInline(start, final, depth);
        return {
          node:
            staticNode ??
            this.rawInline(
              start,
              final,
              'HTML and widgets retain their original source.',
            ),
          end: final,
        };
      }
    }
    if (tail.startsWith('@@')) {
      const closing = this.findFormattingEnd(start + 2, end, '@@');
      const final = closing < 0 ? end : closing + 2;
      const styled = /^\.[\w-]|^[^\s:]+:[^;]+;/.test(tail.slice(2));
      if (styled) {
        return {
          node: this.rawInline(
            start,
            final,
            'TiddlyWiki styled spans retain their CSS and original syntax.',
          ),
          end: final,
        };
      }
    }
    if (/^<%\s*if\s/.test(tail)) {
      const final = this.findConditionalEnd(start, end);
      return {
        node: this.rawInline(
          start,
          final,
          'Conditional branches require a TiddlyWiki evaluation context.',
        ),
        end: final,
      };
    }
    if (tail.startsWith('((')) {
      const opening = tail.startsWith('(((') ? '(((' : '((';
      const closing = opening === '(((' ? ')))' : '))';
      const final = this.findDelimitedEnd(start, end, opening, closing);
      return {
        node: this.rawInline(
          start,
          final,
          'Multi-valued variable and filter displays require a TiddlyWiki evaluation context.',
        ),
        end: final,
      };
    }
    const dash = /^-{2,3}(?!-)/.exec(tail);
    if (dash) {
      return {
        node: {
          type: 'text',
          value: dash[0].length === 2 ? '–' : '—',
          range: { start, end: start + dash[0].length },
        },
        end: start + dash[0].length,
      };
    }
    const systemLink = /^(~?)(\$:\/[\p{L}\p{N}/._-]+)/u.exec(tail);
    if (systemLink) {
      const target = systemLink[2];
      const range = { start, end: start + systemLink[0].length };
      const node: InlineNode = systemLink[1]
        ? { type: 'text', value: target, range }
        : {
            type: 'link',
            target,
            label: [{ type: 'text', value: target }],
            external: false,
            range,
          };
      return { node, end: range.end };
    }
    const entity = /^&(?:#x[\da-f]+|#\d+|[a-z][a-z\d]+);/i.exec(tail);
    if (entity) {
      const value = decodeHTML(entity[0]);
      return {
        node: {
          type: 'text',
          value,
          range: { start, end: start + entity[0].length },
        },
        end: start + entity[0].length,
      };
    }
    const escapedExternal = tail.startsWith('~')
      ? bareExternalLink.exec(tail.slice(1))
      : null;
    if (escapedExternal) {
      return {
        node: {
          type: 'text',
          value: escapedExternal[0],
          range: { start, end: start + escapedExternal[0].length + 1 },
        },
        end: start + escapedExternal[0].length + 1,
      };
    }
    const escapedLink = /^~([A-Z][a-z]+[A-Z][A-Za-z]*)/.exec(tail);
    if (escapedLink) {
      return {
        node: {
          type: 'text',
          value: escapedLink[1],
          range: { start, end: start + escapedLink[0].length },
        },
        end: start + escapedLink[0].length,
      };
    }
    const bareUrl = bareExternalLink.exec(tail);
    if (bareUrl) {
      const target = bareUrl[0];
      return {
        node: {
          type: 'link',
          target,
          label: [{ type: 'text', value: target }],
          external: true,
          range: { start, end: start + target.length },
        },
        end: start + target.length,
      };
    }
    for (const [marker, type] of formattingMarkers) {
      if (!tail.startsWith(marker)) {
        continue;
      }
      const final = this.findFormattingEnd(start + marker.length, end, marker);
      if (final < 0) {
        this.warn(
          'tw-unclosed-formatting',
          `The ${type} marker has no closing delimiter.`,
          { start, end },
        );
        return {
          node: this.rawInline(
            start,
            end,
            'Unfinished formatting retains its original source.',
          ),
          end,
        };
      }
      const contentStart = start + marker.length;
      return {
        node: {
          type,
          children: this.parseInline(contentStart, final, depth + 1),
          range: { start, end: final + marker.length },
        },
        end: final + marker.length,
      };
    }
    if (tail.startsWith('\r\n') || tail.startsWith('\n')) {
      const length = tail.startsWith('\r\n') ? 2 : 1;
      return {
        node: {
          type: 'break',
          hard: false,
          range: { start, end: start + length },
        },
        end: start + length,
      };
    }
    return undefined;
  }

  private matchImage(start: number, end: number): InlineMatch {
    const contentStart = this.findImageContentStart(start, end);
    const closing = this.source.indexOf(']]', contentStart + 1);
    const closed = contentStart < end && closing >= 0 && closing + 2 <= end;
    if (!closed) {
      return {
        node: this.rawInline(start, end, 'The image syntax is unfinished.'),
        end,
      };
    }
    const final = closing + 2;
    const attributes = this.source.slice(start + 4, contentStart).trim();
    const value = this.source.slice(contentStart + 1, closing);
    const separator = value.indexOf('|');
    const target = (separator < 0 ? value : value.slice(separator + 1)).trim();
    const tooltip =
      separator < 0 ? undefined : value.slice(0, separator).trim();
    const node: Extract<InlineNode, { type: 'embed' }> = {
      type: 'embed',
      target,
      alt: '',
      kind: 'image',
      range: { start, end: final },
    };
    const attributePattern =
      /\s*(width|height|alt|tooltip)\s*=\s*(?:"""([\s\S]*?)"""|"([^"\n]*)"|'([^'\n]*)'|([^\s]+))/gy;
    let position = 0;
    while (position < attributes.length) {
      attributePattern.lastIndex = position;
      const attribute = attributePattern.exec(attributes);
      if (!attribute) {
        return {
          node: this.rawInline(
            start,
            final,
            'Dynamic or extended image attributes retain their original syntax.',
          ),
          end: final,
        };
      }
      const attributeValue =
        attribute[2] ?? attribute[3] ?? attribute[4] ?? attribute[5];
      const dimension = attribute[1] === 'width' || attribute[1] === 'height';
      if (dimension && !/^\d+(?:\.\d+)?(?:px|%)?$/.test(attributeValue)) {
        return {
          node: this.rawInline(
            start,
            final,
            'The image size is dynamic or uses an unsupported unit.',
          ),
          end: final,
        };
      }
      if (attribute[1] === 'width') {
        node.width = attributeValue;
      } else if (attribute[1] === 'height') {
        node.height = attributeValue;
      } else if (attribute[1] === 'alt') {
        node.alt = attributeValue;
      } else {
        node.title = attributeValue;
      }
      position = attributePattern.lastIndex;
    }
    if (tooltip) {
      node.title = tooltip;
    }
    return { node, end: final };
  }

  private findProtectedEnd(start: number, end: number): number {
    const tail = this.source.slice(start, Math.min(end, start + 8));
    if (tail.startsWith('[img')) {
      const contentStart = this.findImageContentStart(start, end);
      const closing = this.source.indexOf(']]', contentStart + 1);
      return closing >= 0 && closing + 2 <= end ? closing + 2 : end;
    }
    const delimiters: [string, string][] = [
      ['<!--', '-->'],
      ['/%', '%/'],
      ['[[', ']]'],
      ['[ext[', ']]'],
      ['{{{', '}}}'],
      ['{{', '}}'],
      ['<<', '>>'],
      ['"""', '"""'],
      ['(((', ')))'],
      ['((', '))'],
    ];
    for (const [opening, closing] of delimiters) {
      if (tail.startsWith(opening)) {
        const final = this.findDelimitedEnd(start, end, opening, closing);
        const unclosedMacro =
          opening === '<<' && this.source.slice(final - 2, final) !== '>>';
        if (!unclosedMacro) {
          return final;
        }
        return start + 2;
      }
    }
    if (tail.startsWith('`')) {
      const marker = tail.startsWith('``') ? '``' : '`';
      const closing = this.source.indexOf(marker, start + marker.length);
      return closing >= 0 && closing + marker.length <= end
        ? closing + marker.length
        : end;
    }
    if (/^<%\s*if\s/.test(tail)) {
      return this.findConditionalEnd(start, end);
    }
    if (tail.startsWith('<')) {
      return this.findHtmlEnd(start, end);
    }
    const url = bareExternalLink.exec(this.source.slice(start, end));
    if (url) {
      return start + url[0].length;
    }
    return start;
  }

  private findParagraphEnd(start: number, end: number): number {
    let cursor = start;
    while (cursor < end) {
      const remainder = this.source.slice(cursor, end);
      const boundary =
        /^\r?\n[ \t]*\r?\n/.test(remainder) || /^\r?\n\s*$/.test(remainder);
      if (boundary) {
        return cursor;
      }
      const protectedEnd = this.findProtectedEnd(cursor, end);
      cursor = protectedEnd > cursor ? protectedEnd : cursor + 1;
    }
    return end;
  }

  private findImageContentStart(start: number, end: number): number {
    let cursor = start + 4;
    let quote = '';
    while (cursor < end) {
      if (quote) {
        if (this.source.startsWith(quote, cursor)) {
          cursor += quote.length;
          quote = '';
        } else {
          cursor++;
        }
        continue;
      }
      const character = this.source[cursor];
      if (character === '"' || character === "'") {
        quote = this.source.startsWith('"""', cursor) ? '"""' : character;
        cursor += quote.length;
        continue;
      }
      const dynamicDelimiters: [string, string][] = [
        ['{{{', '}}}'],
        ['{{', '}}'],
        ['<<', '>>'],
      ];
      const dynamic = dynamicDelimiters.find(([opening]) =>
        this.source.startsWith(opening, cursor),
      );
      if (dynamic) {
        cursor = this.findDelimitedEnd(cursor, end, dynamic[0], dynamic[1]);
        continue;
      }
      if (character === '[') {
        return cursor;
      }
      cursor++;
    }
    return end;
  }

  private findFormattingEnd(
    start: number,
    end: number,
    marker: string,
  ): number {
    let cursor = start;
    while (cursor < end) {
      if (this.source.startsWith(marker, cursor)) {
        return cursor;
      }
      const protectedEnd = this.findProtectedEnd(cursor, end);
      cursor = protectedEnd > cursor ? protectedEnd : cursor + 1;
    }
    return -1;
  }

  private findConditionalEnd(start: number, end: number): number {
    const markers = /<%\s*(if\s|endif\s*%>)/g;
    markers.lastIndex = start;
    let depth = 0;
    let match: RegExpExecArray | null;
    while ((match = markers.exec(this.source))) {
      if (match.index >= end) {
        break;
      }
      if (match[1].startsWith('if')) {
        depth++;
      } else {
        depth--;
      }
      if (depth === 0) {
        return Math.min(end, markers.lastIndex);
      }
    }
    return end;
  }

  private findDelimitedEnd(
    start: number,
    end: number,
    opening: string,
    closing: string,
  ): number {
    let cursor = start + opening.length;
    let quote = '';
    const quoted = opening === '<<';
    while (cursor < end) {
      const character = this.source[cursor];
      if (quoted && quote) {
        if (this.source.startsWith(quote, cursor)) {
          cursor += quote.length - 1;
          quote = '';
        }
      } else if (quoted && this.source.startsWith('[[', cursor)) {
        quote = ']]';
        cursor++;
      } else if (quoted && (character === '"' || character === "'")) {
        quote = this.source.startsWith('"""', cursor) ? '"""' : character;
        cursor += quote.length - 1;
      } else if (this.source.startsWith(closing, cursor)) {
        return Math.min(end, cursor + closing.length);
      }
      cursor++;
    }
    return end;
  }

  private findHtmlEnd(start: number, end: number): number {
    if (this.source.startsWith('<!--', start)) {
      return this.findDelimitedEnd(start, end, '<!--', '-->');
    }
    const opening = /^<([a-z][\w:-]*|\$[\w-]+)\b/i.exec(
      this.source.slice(start, end),
    );
    if (!opening) {
      return start;
    }
    const tagEnd = this.findTagEnd(start + opening[0].length, end);
    if (tagEnd < 0) {
      return end;
    }
    const tag = opening[1].toLowerCase();
    const selfClosing =
      /\/\s*>$/.test(this.source.slice(start, tagEnd)) || voidElements.has(tag);
    if (selfClosing) {
      return tagEnd;
    }
    const tagPattern = new RegExp(
      '<(/?)' + tag.replace('$', '\\$') + '(?=[\\s/>])',
      'gi',
    );
    tagPattern.lastIndex = tagEnd;
    let nesting = 1;
    let match: RegExpExecArray | null;
    while ((match = tagPattern.exec(this.source))) {
      if (match.index >= end) {
        break;
      }
      const close = this.findTagEnd(tagPattern.lastIndex, end);
      if (close < 0) {
        return end;
      }
      if (match[1]) {
        nesting--;
      } else if (!/\/\s*>$/.test(this.source.slice(match.index, close))) {
        nesting++;
      }
      if (nesting === 0) {
        return close;
      }
      tagPattern.lastIndex = close;
    }
    return end;
  }

  private findTagEnd(start: number, end: number): number {
    let quote = '';
    for (let cursor = start; cursor < end; cursor++) {
      const character = this.source[cursor];
      if (quote) {
        if (this.source.startsWith(quote, cursor)) {
          cursor += quote.length - 1;
          quote = '';
        }
      } else if (character === '"' || character === "'") {
        quote = this.source.startsWith('"""', cursor) ? '"""' : character;
        cursor += quote.length - 1;
      } else if (character === '>') {
        return cursor + 1;
      }
    }
    return -1;
  }

  private parseStaticAttributes(
    start: number,
    end: number,
  ): Record<string, string> | undefined {
    const attributes: Record<string, string> = {};
    const value = this.source.slice(start, end).replace(/\/?\s*>$/, '');
    const pattern =
      /\s*([\w:-]+)(?:\s*=\s*(?:"""([\s\S]*?)"""|"([^"]*)"|'([^']*)'|([^\s<>"'=]+)))?/gy;
    let cursor = 0;
    while (cursor < value.length) {
      if (!value.slice(cursor).trim()) {
        break;
      }
      pattern.lastIndex = cursor;
      const match = pattern.exec(value);
      if (!match) {
        return undefined;
      }
      const attribute = match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
      const dynamicAttribute =
        match[5] && /^(?:\{\{|<<|\(\(|`)/.test(attribute);
      if (dynamicAttribute) {
        return undefined;
      }
      attributes[match[1]] = attribute;
      cursor = pattern.lastIndex;
    }
    return attributes;
  }

  private parseStaticHtmlInline(
    start: number,
    end: number,
    depth: number,
  ): InlineNode | undefined {
    const opening = /^<([a-z][\w:-]*|\$[\w-]+)\b/i.exec(
      this.source.slice(start, end),
    );
    if (!opening) {
      return undefined;
    }
    const tag = opening[1].toLowerCase();
    const openEnd = this.findTagEnd(start + opening[0].length, end);
    if (openEnd < 0) {
      return undefined;
    }
    const attributes = this.parseStaticAttributes(
      start + opening[0].length,
      openEnd,
    );
    if (!attributes) {
      return undefined;
    }
    const range = { start, end };
    if (tag === 'br' && Object.keys(attributes).length === 0) {
      return { type: 'break', hard: true, range };
    }
    const formatting: Record<string, FormattingType> = {
      strong: 'strong',
      b: 'strong',
      em: 'emphasis',
      i: 'emphasis',
      u: 'underline',
      s: 'strike',
      del: 'strike',
      mark: 'highlight',
      sup: 'superscript',
      sub: 'subscript',
    };
    const closeStart = this.source.lastIndexOf('</', end);
    if (tag === '$image') {
      const knownAttributes = Object.keys(attributes).every((name) =>
        ['source', 'tooltip', 'alt', 'width', 'height'].includes(name),
      );
      if (!knownAttributes || !attributes.source) {
        return undefined;
      }
      const node: Extract<InlineNode, { type: 'embed' }> = {
        type: 'embed',
        target: attributes.source,
        alt: attributes.alt ?? '',
        kind: 'image',
        range,
      };
      if (attributes.width) {
        node.width = attributes.width;
      }
      if (attributes.height) {
        node.height = attributes.height;
      }
      if (attributes.tooltip !== undefined) {
        node.title = attributes.tooltip;
      }
      return node;
    }
    if (closeStart < openEnd) {
      return undefined;
    }
    if (tag === 'sup' && Object.keys(attributes).length === 0) {
      const footnoteLink = /^<a href="#footnote-([^"<>]+)">[\s\S]*<\/a>$/.exec(
        this.source.slice(openEnd, closeStart),
      );
      if (footnoteLink) {
        try {
          return {
            type: 'footnoteReference',
            identifier: decodeURIComponent(footnoteLink[1]),
            range,
          };
        } catch {
          return undefined;
        }
      }
    }
    if (formatting[tag] && Object.keys(attributes).length === 0) {
      return {
        type: formatting[tag],
        children: this.parseInline(openEnd, closeStart, depth + 1),
        range,
      };
    }
    if (tag === 'code' && Object.keys(attributes).length === 0) {
      const contents = this.parseInline(openEnd, closeStart, depth + 1);
      const literal = contents.every(
        (child) => child.type === 'text' || child.type === 'break',
      );
      if (literal) {
        return {
          type: 'code',
          value: contents
            .map((child) => (child.type === 'text' ? child.value : '\n'))
            .join(''),
          range,
        };
      }
    }
    if (tag === 'a' || tag === '$link') {
      const knownAttributes = Object.keys(attributes).every((name) =>
        (tag === 'a' ? ['href', 'title'] : ['to', 'tooltip']).includes(name),
      );
      const target = tag === 'a' ? attributes.href : attributes.to;
      if (!knownAttributes || target === undefined) {
        return undefined;
      }
      const node: Extract<InlineNode, { type: 'link' }> = {
        type: 'link',
        target,
        label: this.parseInline(openEnd, closeStart, depth + 1),
        external: tag === 'a',
        range,
      };
      if (attributes.title !== undefined) {
        node.title = attributes.title;
      }
      if (tag === '$link' && attributes.tooltip !== undefined) {
        node.title = attributes.tooltip;
      }
      return node;
    }
    return undefined;
  }

  private parseStaticHtmlBlock(
    start: number,
    end: number,
  ): BlockNode | undefined {
    const opening = /^<(ul|ol|pre|aside|div)\b/i.exec(
      this.source.slice(start, end),
    );
    if (!opening) {
      return undefined;
    }
    const tag = opening[1].toLowerCase();
    const openEnd = this.findTagEnd(start + opening[0].length, end);
    const closeStart = this.source.lastIndexOf('</' + tag, end);
    if (openEnd < 0 || closeStart < openEnd) {
      return undefined;
    }
    const attributes = this.parseStaticAttributes(
      start + opening[0].length,
      openEnd,
    );
    if (!attributes) {
      return undefined;
    }
    const range = { start, end };
    if (tag === 'aside') {
      const knownAttributes = Object.keys(attributes).every((name) =>
        [
          'class',
          'data-callout',
          'data-callout-title',
          'data-callout-fold',
        ].includes(name),
      );
      const validFold =
        attributes['data-callout-fold'] === undefined ||
        /^[+-]$/.test(attributes['data-callout-fold']);
      const invalidCallout =
        !knownAttributes ||
        attributes.class !== 'callout' ||
        !attributes['data-callout'] ||
        !validFold;
      if (invalidCallout) {
        return undefined;
      }
      let contentStart = openEnd;
      while (contentStart < closeStart) {
        const leadingWhitespace = /\s/.test(this.source[contentStart]);
        if (!leadingWhitespace) {
          break;
        }
        contentStart++;
      }
      if (!this.source.startsWith('<strong>', contentStart)) {
        return undefined;
      }
      const titleEnd = this.findHtmlEnd(contentStart, closeStart);
      const titleClose = this.source.lastIndexOf('</strong>', titleEnd);
      if (titleClose < contentStart) {
        return undefined;
      }
      const titleNodes = this.parseInline(
        contentStart + '<strong>'.length,
        titleClose,
      );
      const callout: NonNullable<
        Extract<BlockNode, { type: 'quote' }>['callout']
      > = {
        type: attributes['data-callout'],
        title: attributes['data-callout-title'] ?? '',
      };
      const richTitle = titleNodes.some((node) => node.type !== 'text');
      if (richTitle) {
        callout.titleNodes = titleNodes;
      }
      if (attributes['data-callout-fold']) {
        callout.fold = attributes['data-callout-fold'] as '+' | '-';
      }
      return {
        type: 'quote',
        callout,
        children: this.parseFragment(titleEnd, closeStart),
        range,
      };
    }
    if (tag === 'div') {
      const knownAttributes =
        Object.keys(attributes).length === 1 &&
        attributes.id?.startsWith('footnote-');
      if (!knownAttributes) {
        return undefined;
      }
      let contentStart = openEnd;
      while (contentStart < closeStart) {
        const leadingWhitespace = /\s/.test(this.source[contentStart]);
        if (!leadingWhitespace) {
          break;
        }
        contentStart++;
      }
      if (!this.source.startsWith('<sup>', contentStart)) {
        return undefined;
      }
      contentStart = this.findHtmlEnd(contentStart, closeStart);
      try {
        return {
          type: 'footnoteDefinition',
          identifier: decodeURIComponent(
            attributes.id.slice('footnote-'.length),
          ),
          children: this.parseFragment(contentStart, closeStart),
          range,
        };
      } catch {
        return undefined;
      }
    }
    if (tag === 'pre') {
      const code = /^<code(?: class=("[^"]*"|'[^']*'))?>/.exec(
        this.source.slice(openEnd, closeStart),
      );
      const codeClose = this.source.lastIndexOf('</code>', closeStart);
      if (!code || codeClose < openEnd || Object.keys(attributes).length) {
        return undefined;
      }
      const contentStart = openEnd + code[0].length;
      const content = this.parseInline(contentStart, codeClose);
      const literal = content.every(
        (child) => child.type === 'text' || child.type === 'break',
      );
      if (!literal) {
        return undefined;
      }
      const language = code[1]?.slice(1, -1).replace(/^language-/, '') ?? '';
      return {
        type: 'code',
        value: content
          .map((child) => (child.type === 'text' ? child.value : '\n'))
          .join(''),
        language,
        range,
      };
    }
    const knownAttributes = Object.keys(attributes).every(
      (name) => tag === 'ol' && name === 'start',
    );
    const invalidListAttributes =
      !knownAttributes ||
      (attributes.start !== undefined && !/^\d+$/.test(attributes.start));
    if (invalidListAttributes) {
      return undefined;
    }
    const children: ListItem[] = [];
    let cursor = openEnd;
    while (cursor < closeStart) {
      while (cursor < closeStart && /\s/.test(this.source[cursor])) {
        cursor++;
      }
      if (cursor === closeStart) {
        break;
      }
      if (!this.source.startsWith('<li>', cursor)) {
        return undefined;
      }
      const itemStart = cursor;
      const itemEnd = this.findHtmlEnd(cursor, closeStart);
      const contentEnd = this.source.lastIndexOf('</li>', itemEnd);
      if (itemEnd <= cursor || contentEnd < cursor + 4) {
        return undefined;
      }
      let contentStart = cursor + 4;
      while (contentStart < contentEnd) {
        const leadingWhitespace = /\s/.test(this.source[contentStart]);
        if (!leadingWhitespace) {
          break;
        }
        contentStart++;
      }
      const checkbox =
        /^<input type="checkbox" disabled( checked)?(?: data-task-marker=(?:"([^"]*)"|'([^']*)'))?\/>[ \t]*/.exec(
          this.source.slice(contentStart, contentEnd),
        );
      if (checkbox) {
        contentStart += checkbox[0].length;
      }
      const blocks = this.parseFragment(contentStart, contentEnd);
      const entry: ListItem = {
        blocks,
        range: { start: itemStart, end: itemEnd },
      };
      if (checkbox) {
        entry.checked = Boolean(checkbox[1]);
      }
      const hasCustomTaskMarker =
        checkbox && (checkbox[2] !== undefined || checkbox[3] !== undefined);
      if (hasCustomTaskMarker) {
        entry.taskMarker = checkbox[2] ?? checkbox[3];
      }
      children.push(entry);
      cursor = itemEnd;
    }
    return {
      type: 'list',
      ordered: tag === 'ol',
      start: Number(attributes.start ?? 1),
      children,
      range,
    };
  }

  private parseFragment(start: number, end: number): BlockNode[] {
    const fragment = new TiddlyWikiParser(this.source.slice(start, end));
    const blocks = fragment.parseBlocks(0, fragment.lines.length);
    shiftRanges(blocks, start);
    for (const diagnostic of fragment.diagnostics) {
      this.diagnostics.push({
        ...diagnostic,
        range: {
          start: diagnostic.range.start + start,
          end: diagnostic.range.end + start,
        },
      });
    }
    return blocks;
  }
}

function shiftRanges(value: unknown, offset: number): void {
  if (Array.isArray(value)) {
    for (const child of value) {
      shiftRanges(child, offset);
    }
    return;
  }
  if (value === null || typeof value !== 'object') {
    return;
  }
  const record = value as Record<string, unknown>;
  const range = record.range as SourceRange | undefined;
  if (range) {
    range.start += offset;
    range.end += offset;
  }
  for (const [key, child] of Object.entries(record)) {
    if (key !== 'range') {
      shiftRanges(child, offset);
    }
  }
}
