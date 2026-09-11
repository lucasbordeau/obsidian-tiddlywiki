import type { Token } from '../../types/Token';
import type { TokenCursor } from '../../types/TokenCursor';
import type { ParseContext } from '../../types/ParseContext';
import type { BlockNode } from '../../../../model/blocks/BlockNode';
import { getTokenSourceRange } from '../getTokenSourceRange';
import { collectInlineChildren } from '../inlines/collectInlineChildren';
import { parseList } from './parseList';
import { parseQuote } from './parseQuote';
import { parseTable } from './parseTable';
import { parseFootnoteDefinition } from './parseFootnoteDefinition';
import { parseRawBlock } from './parseRawBlock';

export function collectBlocks(
  tokens: Token[],
  cursor: TokenCursor,
  context: ParseContext,
  closingType?: string,
): BlockNode[] {
  const blocks: BlockNode[] = [];

  while (cursor.position < tokens.length) {
    const token = tokens[cursor.position++];

    if (token.type === closingType) {
      break;
    }

    const range = getTokenSourceRange(token, context);
    let block: BlockNode | undefined;

    switch (token.type) {
      case 'heading_open':
        block = {
          type: 'heading',
          level: Number(token.tag.slice(1)),
          children: collectInlineChildren(tokens[cursor.position++]),
        };

        cursor.position++;

        break;
      case 'paragraph_open':
        block = {
          type: 'paragraph',
          children: collectInlineChildren(tokens[cursor.position++]),
        };

        cursor.position++;

        break;
      case 'fence':
      case 'code_block':
        block = {
          type: 'code',
          value: token.content.replace(/\n$/, ''),
          language: token.info.trim(),
        };

        break;
      case 'bullet_list_open':
      case 'ordered_list_open':
        block = parseList(tokens, cursor, token, context, collectBlocks);

        break;
      case 'blockquote_open':
        block = parseQuote(tokens, cursor, context, collectBlocks);

        break;
      case 'table_open':
        block = parseTable(tokens, cursor);

        break;
      case 'hr':
        block = { type: 'thematicBreak' };

        break;
      case 'otw_math_block':
        block = { type: 'math', value: token.content };

        break;
      case 'otw_footnote_definition': {
        block = parseFootnoteDefinition(token, context, collectBlocks);

        break;
      }

      case 'html_block':
      case 'otw_frontmatter':
      case 'otw_comment_block': {
        block = parseRawBlock(token, context, range);

        break;
      }

      default:
        if (token.nesting === -1) {
          break;
        }

        block = {
          type: 'raw',
          value: range
            ? context.source.slice(range.start, range.end)
            : token.content,
          dialect: 'obsidian',
          reason: `Markdown block token ${token.type}`,
        };
    }

    if (block) {
      if (range) {
        block.range = range;
      }

      blocks.push(block);
    }
  }

  return blocks;
}
