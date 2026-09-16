import { scanFence } from '@/modules/conversion-core/lexing/scanners/scanFence';

/**
 * Absolute, half-open range protected by one Obsidian code fence.
 *
 * ```ts
 * const source = '~~~\n`\n~~~\n[link](target)';
 * const range: MarkdownFenceRange = { start: 0, end: 10 };
 * source.slice(range.start, range.end); // '~~~\n`\n~~~\n'
 * ```
 */
type MarkdownFenceRange = { start: number; end: number };

/**
 * Record each Markdown label opener's exclusive closing-bracket position.
 * Escaped brackets and brackets inside paired backtick code spans are ignored.
 * Recognized fenced regions are skipped before pairing inline backtick runs,
 * so a backtick inside a fence cannot pair with one in a later link label.
 * An unmatched opener has no entry, so repeated failed Obsidian Markdown links
 * are cheap to reject. TiddlyWiki references use their own `[[...]]` rule.
 *
 * ```ts
 * const source = '[outer [inner]](target) [unfinished';
 * const ends = indexMarkdownLabelEnds(source);
 * ends[0]; // 15: the outer label closes after `]]`
 * ends[7]; // 14: the nested label closes after its first `]`
 * ends[source.lastIndexOf('[')]; // undefined: no closer for the last label
 *
 * const escaped = indexMarkdownLabelEnds('[a\\]b](target)');
 * escaped[0]; // 6: `\\]` is label text, not the closing bracket
 *
 * const coded = indexMarkdownLabelEnds('[a `]` b](target)');
 * coded[0]; // 9: `]` inside `]` code is label text
 *
 * const fenced = '~~~\n`\n~~~\n[a `]` b](target)';
 * indexMarkdownLabelEnds(fenced)[10]; // 19: the later label closes normally
 * ```
 */
export function indexMarkdownLabelEnds(source: string): readonly number[] {
  const labelEnds: number[] = [];
  const openingPositions: number[] = [];
  const fenceRanges = findMarkdownFenceRanges(source);
  const codeSpanEnds = indexMarkdownCodeSpanEnds(source, fenceRanges);
  let fenceIndex = 0;

  for (let cursor = 0; cursor < source.length; cursor++) {
    while (fenceRanges[fenceIndex]?.end <= cursor) {
      fenceIndex++;
    }

    const fenceRange = fenceRanges[fenceIndex];

    if (fenceRange && cursor === fenceRange.start) {
      openingPositions.length = 0;
      cursor = fenceRange.end - 1;
      fenceIndex++;

      continue;
    }

    const character = source[cursor];

    if (character === '\\') {
      cursor++;

      continue;
    }

    if (character === '`') {
      const codeSpanEnd = codeSpanEnds[cursor];

      if (codeSpanEnd !== undefined) {
        cursor = codeSpanEnd - 1;
      }

      continue;
    }

    if (character === '[') {
      openingPositions.push(cursor);

      continue;
    }

    if (character === ']') {
      const openingPosition = openingPositions.pop();

      if (openingPosition !== undefined) {
        labelEnds[openingPosition] = cursor + 1;
      }
    }
  }

  return labelEnds;
}

/**
 * Collect code fences using the same opener and closer rules as `scanFence`.
 * Each returned range is skipped when inline code spans and labels are indexed.
 *
 * ```ts
 * findMarkdownFenceRanges('~~~\n`\n~~~\n[link](target)');
 * // [{ start: 0, end: 10 }], covering the fence and its final newline
 * ```
 */
function findMarkdownFenceRanges(source: string): MarkdownFenceRange[] {
  const fenceRanges: MarkdownFenceRange[] = [];
  let isLinePrefix = true;

  for (let cursor = 0; cursor < source.length; cursor++) {
    const character = source[cursor];

    if (character === '\r' || character === '\n') {
      isLinePrefix = true;

      continue;
    }

    if (isLinePrefix && (character === '`' || character === '~')) {
      const fence = scanFence({
        source,
        dialect: 'obsidian',
        cursor,
        rest: source.slice(cursor),
        isLinePrefix,
      });

      if (fence?.kind === 'code') {
        const fenceRange: MarkdownFenceRange = {
          start: cursor,
          end: fence.end,
        };

        fenceRanges.push(fenceRange);

        cursor = fence.end - 1;

        const finalCharacter = source[cursor];

        isLinePrefix = finalCharacter === '\r' || finalCharacter === '\n';

        continue;
      }
    }

    isLinePrefix = isLinePrefix && /[ \t>]/.test(character);
  }

  return fenceRanges;
}

/**
 * Find the next same-length backtick run for each unescaped run. A valid pair
 * protects its contents while labels are indexed; an unpaired run is literal.
 * Backticks inside fenced regions are omitted from the inline run sequence.
 *
 * ```ts
 * const ends = indexMarkdownCodeSpanEnds('`a ] b` ``c ] d``', []);
 * ends[0]; // 7: after the matching single backtick
 * ends[8]; // 17: after the matching double backticks
 * ```
 */
function indexMarkdownCodeSpanEnds(
  source: string,
  fenceRanges: readonly MarkdownFenceRange[],
): readonly number[] {
  const backtickRuns: { start: number; length: number }[] = [];
  let fenceIndex = 0;

  for (let cursor = 0; cursor < source.length; cursor++) {
    const fenceRange = fenceRanges[fenceIndex];

    if (fenceRange && cursor === fenceRange.start) {
      cursor = fenceRange.end - 1;
      fenceIndex++;

      continue;
    }

    if (source[cursor] === '\\') {
      cursor++;

      continue;
    }

    if (source[cursor] === '`') {
      const start = cursor;

      while (source[cursor + 1] === '`') {
        cursor++;
      }

      const backtickRun = { start, length: cursor - start + 1 };

      backtickRuns.push(backtickRun);
    }
  }

  const codeSpanEnds: number[] = [];
  const nextRunByLength = new Map<number, number>();

  for (let index = backtickRuns.length - 1; index >= 0; index--) {
    const backtickRun = backtickRuns[index];
    const nextRun = nextRunByLength.get(backtickRun.length);

    if (nextRun !== undefined) {
      codeSpanEnds[backtickRun.start] = nextRun + backtickRun.length;
    }

    nextRunByLength.set(backtickRun.length, backtickRun.start);
  }

  return codeSpanEnds;
}
