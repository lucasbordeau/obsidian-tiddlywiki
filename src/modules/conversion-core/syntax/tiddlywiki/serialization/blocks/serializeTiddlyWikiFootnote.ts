import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/escapeTiddlyWikiText';

export function serializeTiddlyWikiFootnote(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'footnoteDefinition' }>,
): string {
  const id = encodeURIComponent(block.identifier);

  return `<div id="footnote-${id}">\n\n<sup>${escapeTiddlyWikiText(block.identifier)}</sup> ${this.serializeBlocks(block.children)}\n\n</div>`;
}
