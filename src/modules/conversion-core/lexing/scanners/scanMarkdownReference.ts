import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findMarkdownLinkEnd } from '@/modules/conversion-core/lexing/boundaries/findMarkdownLinkEnd';

export function scanMarkdownReference(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const isMarkdownImage =
    dialect === 'obsidian' && source.startsWith('![', cursor);

  const isMarkdownLink = dialect === 'obsidian' && source[cursor] === '[';

  if (isMarkdownImage || isMarkdownLink) {
    const end = findMarkdownLinkEnd(source, cursor + (isMarkdownImage ? 1 : 0));

    if (end !== undefined) {
      return { kind: isMarkdownImage ? 'embed' : 'link', end: end };
    }
  }

  return undefined;
}
