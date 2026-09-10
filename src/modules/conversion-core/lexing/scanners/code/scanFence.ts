import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { fenceEnd } from '../../boundaries/code/fenceEnd';

export function scanFence(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor, rest, isLinePrefix } = context;
  const fence = isLinePrefix ? /^(\x60{3,}|~{3,})[^\r\n]*/.exec(rest) : null;

  const isSupportedFence =
    fence && (dialect === 'obsidian' || fence[1] === '```');

  if (isSupportedFence && fence) {
    return { kind: 'code', end: fenceEnd(source, cursor, fence[1], dialect) };
  }

  return undefined;
}
