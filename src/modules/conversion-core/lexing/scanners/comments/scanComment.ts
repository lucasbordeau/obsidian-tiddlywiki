import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { delimitedEnd } from '../../boundaries/delimiters/delimitedEnd';

export function scanComment(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  if (source.startsWith('<!--', cursor)) {
    const closing = source.indexOf('-->', cursor + 4);

    return { kind: 'comment', end: closing < 0 ? source.length : closing + 3 };
  }

  if (dialect === 'obsidian' && source.startsWith('%%', cursor)) {
    return { kind: 'comment', end: delimitedEnd(source, cursor + 2, '%%') };
  }

  if (dialect === 'tiddlywiki' && source.startsWith('/%', cursor)) {
    return { kind: 'comment', end: delimitedEnd(source, cursor + 2, '%/') };
  }

  return undefined;
}
