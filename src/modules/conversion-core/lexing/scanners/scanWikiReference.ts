import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';
import { findDelimitedEnd } from '../boundaries/findDelimitedEnd';

export function scanWikiReference(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const isWikiEmbed =
    dialect === 'obsidian' && source.startsWith('![[', cursor);

  if (isWikiEmbed || source.startsWith('[[', cursor)) {
    return {
      kind: isWikiEmbed ? 'embed' : 'link',
      end: findDelimitedEnd(source, cursor + (isWikiEmbed ? 3 : 2), ']]'),
    };
  }

  return undefined;
}
