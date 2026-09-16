import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findFenceEnd } from '@/modules/conversion-core/lexing/boundaries/findFenceEnd';

export function scanFence(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor, rest, isLinePrefix } = context;
  const fence = isLinePrefix ? /^(\x60{3,}|~{3,})[^\r\n]*/.exec(rest) : null;

  const isSupportedFence =
    fence && (dialect === 'obsidian' || fence[1] === '```');

  if (isSupportedFence && fence) {
    return {
      kind: 'code',
      end: findFenceEnd(source, cursor, fence[1], dialect),
    };
  }

  return undefined;
}
