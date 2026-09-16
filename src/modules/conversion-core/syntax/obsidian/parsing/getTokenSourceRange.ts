import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

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
