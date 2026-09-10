import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { ParsedDocument } from '../../../../model/ast/documents/ParsedDocument';
import { encodePreservedSource } from '../../../../preservation/source/encoding/encodePreservedSource';
import { serializeObsidian } from '../../../obsidian/serialization/serializeObsidian';
import type { TiddlyWikiRangedNode } from '../../types/TiddlyWikiRangedNode';
import type { TiddlyWikiSerializationContext } from '../context/types/TiddlyWikiSerializationContext';

export function preserveTiddlyWikiForeignSource(
  this: TiddlyWikiSerializationContext,
  node: TiddlyWikiRangedNode,
  reason: string,
  block = false,
): string {
  this.diagnose(node, 'tw-preserved-foreign-source', reason);

  const blocks: BlockNode[] = block
    ? [node as BlockNode]
    : [{ type: 'paragraph', children: [node as InlineNode] }];

  const fragment: ParsedDocument = { ...this.document, blocks };

  const value = node.range
    ? this.document.source.slice(node.range.start, node.range.end)
    : serializeObsidian(fragment).text;

  return encodePreservedSource({
    dialect: this.document.dialect,
    value,
    reason,
  });
}
