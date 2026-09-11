import type { Token } from '../types/Token';
import type { ParseContext } from '../types/ParseContext';
import type { SourceRange } from '../../../model/SourceRange';

export function getTokenSourceRange(
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
