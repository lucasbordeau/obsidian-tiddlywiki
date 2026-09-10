import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../../context/types/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '../../escaping/escapeTiddlyWikiText';

export function serializeTiddlyWikiFootnote(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'footnoteDefinition' }>,
): string {
  const id = encodeURIComponent(block.identifier);

  return `<div id="footnote-${id}">\n\n<sup>${escapeTiddlyWikiText(block.identifier)}</sup> ${this.serializeBlocks(block.children)}\n\n</div>`;
}
