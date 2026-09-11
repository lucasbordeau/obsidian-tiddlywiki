import MarkdownIt from 'markdown-it';
import { createObsidianParser } from '../syntax/obsidian/parsing/createObsidianParser';
import type { ParsedDocument } from '../model/ParsedDocument';

export function collectObsidianTags(document: ParsedDocument): string[] {
  const parser = createObsidianParser();

  parser.core.ruler.disable('text_join');

  const markdownTokens = parser.parse(document.source, {});

  const tags = new Set<string>();

  const pattern = new RegExp(
    '(?:^|[\\s(\\[{,;:!?])#([\\p{L}\\p{N}\\p{M}\\p{S}\\u200D_/-]+)',
    'gu',
  );

  const numericCharacters = new RegExp('^\\p{N}+$', 'u');

  function visitInline(tokens: MarkdownIt.Token[]): void {
    let linkDepth = 0;
    let literalHtmlDepth = 0;

    for (const token of tokens) {
      if (token.type === 'link_open') {
        linkDepth++;
      } else if (token.type === 'link_close') {
        linkDepth--;
      } else if (token.type === 'html_inline') {
        const literalTag =
          /^<(\/)?(?:script|style|pre|code|textarea)(?:\s|>)/i.exec(
            token.content,
          );

        if (literalTag) {
          literalHtmlDepth = Math.max(
            0,
            literalHtmlDepth + (literalTag[1] ? -1 : 1),
          );
        }
      } else {
        const isTagText =
          token.type === 'text' && linkDepth === 0 && literalHtmlDepth === 0;

        if (isTagText) {
          for (const match of token.content.matchAll(pattern)) {
            const tag = match[1];

            if (!numericCharacters.test(tag)) {
              tags.add(tag);
            }
          }
        }
      }
    }
  }

  for (const token of markdownTokens) {
    const isInlineContent = token.type === 'inline' && token.children !== null;

    if (isInlineContent && token.children) {
      visitInline(token.children);
    }
  }

  return [...tags];
}
