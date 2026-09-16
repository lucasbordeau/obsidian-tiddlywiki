import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { TokenCursor } from '@/modules/conversion-core/syntax/obsidian/types/TokenCursor';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { BlockCollector } from '@/modules/conversion-core/syntax/obsidian/types/BlockCollector';
import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { ListItem } from '@/modules/conversion-core/model/ListItem';
import { getTokenSourceRange } from '@/modules/conversion-core/syntax/obsidian/parsing/getTokenSourceRange';
import { collectInlineNodes } from '@/modules/conversion-core/syntax/obsidian/parsing/inlines/collectInlineNodes';

export function parseList(
  tokens: Token[],
  cursor: TokenCursor,
  opening: Token,
  context: ParseContext,
  collectNestedBlocks: BlockCollector,
): BlockNode {
  const listItems: ListItem[] = [];
  const closingType = opening.type.replace('_open', '_close');

  while (cursor.position < tokens.length) {
    const reachedClosingToken = tokens[cursor.position].type === closingType;

    if (reachedClosingToken) {
      break;
    }

    const listItemToken = tokens[cursor.position++];

    if (listItemToken.type !== 'list_item_open') {
      continue;
    }

    const firstInlineToken =
      tokens[cursor.position]?.type === 'paragraph_open'
        ? tokens[cursor.position + 1]
        : undefined;

    const task =
      firstInlineToken?.type === 'inline'
        ? /^\[([^\r\n])\](?:[ \t]+|$)/u.exec(firstInlineToken.content)
        : null;

    const blocks = collectNestedBlocks(
      tokens,
      cursor,
      context,
      'list_item_close',
    );

    const listItem: ListItem = { blocks };
    const range = getTokenSourceRange(listItemToken, context);

    if (range) {
      listItem.range = range;
    }

    const firstBlock = blocks[0];

    if (task && firstInlineToken && firstBlock?.type === 'paragraph') {
      listItem.checked = task[1] !== ' ';

      if (listItem.checked && task[1] !== 'x') {
        listItem.taskMarker = task[1];
      }

      const taskBodyTokens: Token[] = [];

      context.obsidianParser.inline.parse(
        firstInlineToken.content.slice(task[0].length),
        context.obsidianParser,
        context.parserEnvironment,
        taskBodyTokens,
      );

      firstBlock.children = collectInlineNodes(taskBodyTokens, { position: 0 });
    }

    listItems.push(listItem);
  }

  if (cursor.position < tokens.length) {
    cursor.position++;
  }

  return {
    type: 'list',
    ordered: opening.type === 'ordered_list_open',
    start: Number(opening.attrGet('start') ?? 1),
    children: listItems,
  };
}
