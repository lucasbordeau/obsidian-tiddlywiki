import type { Token } from '../../types/parsing/Token';
import type { TokenCursor } from '../../types/parsing/TokenCursor';
import type { InlineCollector } from '../../types/parsing/InlineCollector';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { parseMarkdownImage } from './parseMarkdownImage';
import { parseWikiToken } from './parseWikiToken';
import { rawInline } from './rawInline';
import { htmlInline } from './htmlInline';

export function parseInlineToken(
  token: Token,
  tokens: Token[],
  cursor: TokenCursor,
  collectNestedInlines: InlineCollector,
): InlineNode {
  switch (token.type) {
    case 'text':
    case 'text_special':
      return { type: 'text', value: token.content };

    case 'code_inline':
      return { type: 'code', value: token.content };

    case 'softbreak':
    case 'hardbreak':
      return { type: 'break', hard: token.type === 'hardbreak' };

    case 'strong_open':
    case 'em_open':
    case 's_open': {
      const formatType =
        token.type === 'strong_open'
          ? 'strong'
          : token.type === 'em_open'
            ? 'emphasis'
            : 'strike';

      const formattedChildren = collectNestedInlines(
        tokens,
        cursor,
        token.type.replace('_open', '_close'),
      );

      return { type: formatType, children: formattedChildren };
    }

    case 'link_open': {
      const target = token.attrGet('href') ?? '';
      const label = collectNestedInlines(tokens, cursor, 'link_close');

      const link: InlineNode = {
        type: 'link',
        target,
        label,
        external: /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target),
      };

      const title = token.attrGet('title');

      if (title !== null) {
        link.title = title;
      }

      return link;
    }

    case 'image': {
      return parseMarkdownImage(
        token,
        collectNestedInlines(token.children ?? [], { position: 0 }),
      );
    }

    case 'otw_wikilink':
    case 'otw_embed':
      return parseWikiToken(token);

    case 'otw_highlight':
      return {
        type: 'highlight',
        children: collectNestedInlines(token.children ?? [], { position: 0 }),
      };

    case 'otw_math':
      return { type: 'math', value: token.content };

    case 'otw_footnote_reference':
      return { type: 'footnoteReference', identifier: token.content };

    case 'otw_inline_footnote':
      return rawInline(token.content, 'Obsidian inline footnote');

    case 'otw_web_embed':
      return rawInline(token.content, 'Obsidian web embed');

    case 'otw_comment':
      return rawInline(token.content, 'Obsidian comment');

    case 'otw_block_identifier':
      return rawInline(token.content, 'Obsidian block identifier');

    case 'html_inline':
    case 'otw_html':
      return htmlInline(token.content);

    default:
      return rawInline(
        token.content || token.markup,
        `Markdown inline token ${token.type}`,
      );
  }
}
