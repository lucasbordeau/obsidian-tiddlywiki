import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '../escapeTiddlyWikiText';

export function serializeTiddlyWikiFootnote(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'footnoteDefinition' }>,
): string {
  const id = encodeURIComponent(block.identifier);

  return `<div id="footnote-${id}">\n\n<sup>${escapeTiddlyWikiText(block.identifier)}</sup> ${this.serializeBlocks(block.children)}\n\n</div>`;
}
