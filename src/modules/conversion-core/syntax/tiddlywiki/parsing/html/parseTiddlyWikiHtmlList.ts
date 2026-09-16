import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { ListItem } from '@/modules/conversion-core/model/ListItem';
import { TiddlyWikiHtmlState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/TiddlyWikiHtmlState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlList(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
  depth = 0,
): BlockNode | undefined {
  const { tag, openEnd, closeStart, attributes, range } = state;

  const knownAttributes = Object.keys(attributes).every(
    (name) => tag === 'ol' && name === 'start',
  );

  const invalidListAttributes =
    !knownAttributes ||
    (attributes.start !== undefined && !/^\d+$/.test(attributes.start));

  if (invalidListAttributes) {
    return undefined;
  }

  const listItems: ListItem[] = [];
  let cursor = openEnd;

  while (cursor < closeStart) {
    while (cursor < closeStart && /\s/.test(this.source[cursor])) {
      cursor++;
    }

    if (cursor === closeStart) {
      break;
    }

    if (!this.source.startsWith('<li>', cursor)) {
      return undefined;
    }

    const itemStart = cursor;
    const itemEnd = this.findHtmlEnd(cursor, closeStart);
    const contentEnd = this.source.lastIndexOf('</li>', itemEnd);

    if (itemEnd <= cursor || contentEnd < cursor + 4) {
      return undefined;
    }

    let contentStart = cursor + 4;

    while (contentStart < contentEnd) {
      const leadingWhitespace = /\s/.test(this.source[contentStart]);

      if (!leadingWhitespace) {
        break;
      }

      contentStart++;
    }

    const checkbox =
      /^<input type="checkbox" disabled( checked)?(?: data-task-marker=(?:"([^"]*)"|'([^']*)'))?\/>[ \t]*/.exec(
        this.source.slice(contentStart, contentEnd),
      );

    if (checkbox) {
      contentStart += checkbox[0].length;
    }

    const blocks = this.parseFragment(contentStart, contentEnd);

    const listItem: ListItem = {
      blocks,
      range: { start: itemStart, end: itemEnd },
    };

    if (checkbox) {
      listItem.checked = Boolean(checkbox[1]);
    }

    const hasCustomTaskMarker =
      checkbox && (checkbox[2] !== undefined || checkbox[3] !== undefined);

    if (hasCustomTaskMarker) {
      listItem.taskMarker = checkbox[2] ?? checkbox[3];
    }

    listItems.push(listItem);

    cursor = itemEnd;
  }

  return {
    type: 'list',
    ordered: tag === 'ol',
    start: Number(attributes.start ?? 1),
    children: listItems,
    range,
  };
}
