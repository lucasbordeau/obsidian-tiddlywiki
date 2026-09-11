import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { ListItem } from '../../../../model/ListItem';
import type { TiddlyWikiHtmlState } from './TiddlyWikiHtmlState';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

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

  const children: ListItem[] = [];
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

    const entry: ListItem = {
      blocks,
      range: { start: itemStart, end: itemEnd },
    };

    if (checkbox) {
      entry.checked = Boolean(checkbox[1]);
    }

    const hasCustomTaskMarker =
      checkbox && (checkbox[2] !== undefined || checkbox[3] !== undefined);

    if (hasCustomTaskMarker) {
      entry.taskMarker = checkbox[2] ?? checkbox[3];
    }

    children.push(entry);

    cursor = itemEnd;
  }

  return {
    type: 'list',
    ordered: tag === 'ol',
    start: Number(attributes.start ?? 1),
    children,
    range,
  };
}
