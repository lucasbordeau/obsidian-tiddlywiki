import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';
import { findDelimitedEnd } from '../boundaries/findDelimitedEnd';

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
      end: findDelimitedEnd(source, cursor + delimiter.length, delimiter),
    };
  }

  return undefined;
}
