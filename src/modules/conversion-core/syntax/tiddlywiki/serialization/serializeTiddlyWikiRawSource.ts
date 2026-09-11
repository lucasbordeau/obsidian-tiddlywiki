import type { BlockNode } from '../../../model/blocks/BlockNode';
import type { InlineNode } from '../../../model/inlines/InlineNode';
import { encodePreservedSource } from '../../../preservation/source/encodePreservedSource';
import type { TiddlyWikiSerializationContext } from './context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiRawSource(
  this: TiddlyWikiSerializationContext,
  node: Extract<BlockNode | InlineNode, { type: 'raw' }>,
): string {
  if (node.dialect === 'tiddlywiki') {
    return node.value;
  }

  this.diagnose(node, 'tw-preserved-foreign-source', node.reason);

  return encodePreservedSource({
    dialect: node.dialect,
    value: node.value,
    reason: node.reason,
  });
}
