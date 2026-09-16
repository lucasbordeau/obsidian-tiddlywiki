import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findDelimitedEnd } from '@/modules/conversion-core/lexing/boundaries/findDelimitedEnd';

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
