import type { Token } from '../../types/Token';
import type { TokenCursor } from '../../types/TokenCursor';
import type { ParseContext } from '../../types/ParseContext';
import type { BlockCollector } from '../../types/BlockCollector';
import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { ListItem } from '../../../../model/ListItem';
import { getTokenSourceRange } from '../getTokenSourceRange';
import { collectInlineNodes } from '../inlines/collectInlineNodes';

export function parseList(
  tokens: Token[],
  cursor: TokenCursor,
  opening: Token,
  context: ParseContext,
  collectNestedBlocks: BlockCollector,
): BlockNode {
  const listEntries: ListItem[] = [];
  const closingType = opening.type.replace('_open', '_close');

  while (cursor.position < tokens.length) {
    const reachedClosingToken = tokens[cursor.position].type === closingType;

    if (reachedClosingToken) {
      break;
    }

    const entryToken = tokens[cursor.position++];

    if (entryToken.type !== 'list_item_open') {
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

    const entry: ListItem = { blocks };
    const range = getTokenSourceRange(entryToken, context);

    if (range) {
      entry.range = range;
    }

    const firstBlock = blocks[0];

    if (task && firstInlineToken && firstBlock?.type === 'paragraph') {
      entry.checked = task[1] !== ' ';

      if (entry.checked && task[1] !== 'x') {
        entry.taskMarker = task[1];
      }

      const taskBodyTokens: Token[] = [];

      context.markdown.inline.parse(
        firstInlineToken.content.slice(task[0].length),
        context.markdown,
        context.environment,
        taskBodyTokens,
      );

      firstBlock.children = collectInlineNodes(taskBodyTokens, { position: 0 });
    }

    listEntries.push(entry);
  }

  if (cursor.position < tokens.length) {
    cursor.position++;
  }

  return {
    type: 'list',
    ordered: opening.type === 'ordered_list_open',
    start: Number(opening.attrGet('start') ?? 1),
    children: listEntries,
  };
}
