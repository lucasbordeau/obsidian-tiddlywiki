import type { SourceRange } from '../../../../model/source/SourceRange';

export function shiftTiddlyWikiSourceRanges(
  value: unknown,
  offset: number,
): void {
  if (Array.isArray(value)) {
    for (const child of value) {
      shiftTiddlyWikiSourceRanges(child, offset);
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
      shiftTiddlyWikiSourceRanges(child, offset);
    }
  }
}
