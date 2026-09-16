import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiTable(
  this: TiddlyWikiParsingContext,
  firstLine: number,
  endLine: number,
): BlockNode {
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
