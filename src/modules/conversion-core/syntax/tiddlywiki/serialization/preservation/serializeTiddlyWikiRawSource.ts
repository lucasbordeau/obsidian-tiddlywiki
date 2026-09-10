import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { encodePreservedSource } from '../../../../preservation/source/encoding/encodePreservedSource';
import type { TiddlyWikiSerializationContext } from '../context/types/TiddlyWikiSerializationContext';

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
