import type { TiddlyWikiSourceLine } from '../../types/TiddlyWikiSourceLine';

export function readTiddlyWikiSourceLines(
  source: string,
): TiddlyWikiSourceLine[] {
  const lines: TiddlyWikiSourceLine[] = [];

  let offset = 0;

  for (const segment of source.split(/(?<=\n)/)) {
    if (!segment) {
      continue;
    }

    const text = segment.replace(/\r?\n$/, '');

    lines.push({
      text,
      start: offset,
      end: offset + text.length,
      next: offset + segment.length,
    });

    offset += segment.length;
  }

  return lines;
}
