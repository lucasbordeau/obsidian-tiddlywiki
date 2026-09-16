import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { encodePreservedSource } from '@/modules/conversion-core/preservation/source/encodePreservedSource';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { TiddlyWikiRangedNode } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiRangedNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

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
