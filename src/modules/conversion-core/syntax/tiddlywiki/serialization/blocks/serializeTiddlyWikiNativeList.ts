import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiNativeList(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'list' }>,
  parentPrefix: string,
): string {
  const prefix = parentPrefix + (block.ordered ? '#' : '*');
  const renderedListItems: string[] = [];

  for (const listItem of block.children) {
    const [first, ...nestedLists] = listItem.blocks;

    const contents =
      first?.type === 'paragraph' ? this.serializeInline(first.children) : '';

    renderedListItems.push(prefix + ' ' + contents);

    for (const nested of nestedLists) {
      if (nested.type === 'list') {
        renderedListItems.push(this.serializeList(nested, prefix));
      }
    }
  }

  return renderedListItems.join('\n');
}
