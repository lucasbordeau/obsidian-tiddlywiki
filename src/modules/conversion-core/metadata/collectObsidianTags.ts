import MarkdownIt from 'markdown-it';
import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';

export function collectObsidianTags(document: ParsedDocument): string[] {
  const obsidianParser = createObsidianParser();

  obsidianParser.core.ruler.disable('text_join');

  const obsidianTokens = obsidianParser.parse(document.source, {});

  const tags = new Set<string>();

  const bodyTagPattern = new RegExp(
    '(?:^|[\\s(\\[{,;:!?])#([\\p{L}\\p{N}\\p{M}\\p{S}\\u200D_/-]+)',
    'gu',
  );

  const numericTagPattern = new RegExp('^\\p{N}+$', 'u');

  function visitInline(inlineTokens: MarkdownIt.Token[]): void {
    let linkDepth = 0;
    let literalHtmlDepth = 0;

    for (const inlineToken of inlineTokens) {
      if (inlineToken.type === 'link_open') {
        linkDepth++;
      } else if (inlineToken.type === 'link_close') {
        linkDepth--;
      } else if (inlineToken.type === 'html_inline') {
        const literalTag =
          /^<(\/)?(?:script|style|pre|code|textarea)(?:\s|>)/i.exec(
            inlineToken.content,
          );

        if (literalTag) {
          literalHtmlDepth = Math.max(
            0,
            literalHtmlDepth + (literalTag[1] ? -1 : 1),
          );
        }
      } else {
        const isTagText =
          inlineToken.type === 'text' &&
          linkDepth === 0 &&
          literalHtmlDepth === 0;

        if (isTagText) {
          for (const match of inlineToken.content.matchAll(bodyTagPattern)) {
            const tag = match[1];

            if (!numericTagPattern.test(tag)) {
              tags.add(tag);
            }
          }
        }
      }
    }
  }

  for (const obsidianToken of obsidianTokens) {
    const isInlineContent =
      obsidianToken.type === 'inline' && obsidianToken.children !== null;

    if (isInlineContent && obsidianToken.children) {
      visitInline(obsidianToken.children);
    }
  }

  return [...tags];
}
