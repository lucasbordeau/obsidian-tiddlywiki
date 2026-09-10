import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../../context/types/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiNativeList(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'list' }>,
  parentPrefix: string,
): string {
  const prefix = parentPrefix + (block.ordered ? '#' : '*');
  const renderedEntries: string[] = [];

  for (const entry of block.children) {
    const [first, ...nestedLists] = entry.blocks;

    const contents =
      first?.type === 'paragraph' ? this.serializeInline(first.children) : '';

    renderedEntries.push(prefix + ' ' + contents);

    for (const nested of nestedLists) {
      if (nested.type === 'list') {
        renderedEntries.push(this.serializeList(nested, prefix));
      }
    }
  }

  return renderedEntries.join('\n');
}
