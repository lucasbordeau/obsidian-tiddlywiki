import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { delimitedEnd } from '../../boundaries/delimiters/delimitedEnd';

export function scanTransclusion(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const transclusion =
    dialect === 'tiddlywiki' && source.startsWith('{{', cursor);

  if (transclusion) {
    const delimiter = source.startsWith('{{{', cursor) ? '}}}' : '}}';

    return {
      kind: 'transclusion',
      end: delimitedEnd(source, cursor + delimiter.length, delimiter),
    };
  }

  return undefined;
}
