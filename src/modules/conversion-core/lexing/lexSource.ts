import type { Dialect } from '../model/source/Dialect';
import type { SyntaxToken } from '../model/source/SyntaxToken';
import { scanNextToken } from './scanners/scanNextToken';

/** Concrete UTF-16 source regions; every source character belongs to one token. */
export function lexSource(source: string, dialect: Dialect): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;
  let lineStart = 0;

  while (cursor < source.length) {
    const rest = source.slice(cursor);
    const linePrefix = source.slice(lineStart, cursor);
    const isLinePrefix = /^[ \t>]*$/.test(linePrefix);

    const matchedToken = scanNextToken({
      source,
      dialect,
      cursor,
      rest,
      isLinePrefix,
    });

    const raw = source.slice(cursor, matchedToken.end);

    tokens.push({
      kind: matchedToken.kind,
      range: { start: cursor, end: matchedToken.end },
      raw,
    });

    const lastNewline = raw.lastIndexOf('\n');

    if (lastNewline >= 0) {
      lineStart = cursor + lastNewline + 1;
    }

    cursor = matchedToken.end;
  }

  return tokens;
}
