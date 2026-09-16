import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { ListItem } from '@/modules/conversion-core/model/ListItem';
import { TiddlyWikiListBlock } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiListBlock';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiLists(
  this: TiddlyWikiParsingContext,
  firstLine: number,
  endLine: number,
): BlockNode[] {
  const listBlocks: BlockNode[] = [];

  const stack: {
    marker: string;
    block: TiddlyWikiListBlock;
    lastItem?: ListItem;
  }[] = [];

  for (let index = firstLine; index < endLine; index++) {
    const line = this.lines[index];
    const match = /^\s*([*#]+)[ \t]?(.*)$/.exec(line.text);

    if (!match) {
      listBlocks.push(
        this.rawBlock(
          line.start,
          line.end,
          'This list prefix needs a TiddlyWiki-specific representation.',
        ),
      );

      stack.length = 0;

      continue;
    }

    const markers = match[1];
    let commonDepth = 0;
    const matchingDepth = Math.min(markers.length, stack.length);

    while (commonDepth < matchingDepth) {
      const markerMatchesStack =
        markers[commonDepth] === stack[commonDepth].marker;

      if (!markerMatchesStack) {
        break;
      }

      commonDepth++;
    }

    stack.length = commonDepth;

    while (stack.length < markers.length) {
      const depth = stack.length;
      const marker = markers[depth];

      const block: TiddlyWikiListBlock = {
        type: 'list',
        ordered: marker === '#',
        start: 1,
        children: [],
        range: { start: line.start, end: line.end },
      };

      const parent = stack[depth - 1];

      if (parent) {
        if (!parent.lastItem) {
          parent.lastItem = {
            blocks: [],
            range: { start: line.start, end: line.end },
          };

          parent.block.children.push(parent.lastItem);
        }

        parent.lastItem.blocks.push(block);
      } else {
        listBlocks.push(block);
      }

      stack.push({ marker, block });
    }

    const contentStart = line.end - match[2].length;

    const item: ListItem = {
      blocks: [
        {
          type: 'paragraph',
          children: this.parseInline(contentStart, line.end),
          range: { start: contentStart, end: line.end },
        },
      ],
      range: { start: line.start, end: line.end },
    };

    const current = stack[stack.length - 1];

    current.block.children.push(item);

    current.lastItem = item;

    for (const frame of stack) {
      if (frame.block.range) {
        frame.block.range.end = line.end;
      }

      if (frame.lastItem?.range) {
        frame.lastItem.range.end = line.end;
      }
    }
  }

  return listBlocks;
}
