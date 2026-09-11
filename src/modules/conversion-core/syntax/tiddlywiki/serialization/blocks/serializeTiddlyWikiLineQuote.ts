import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiLineQuote(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'quote' }>,
  prefix: string,
): string {
  const quotePrefix = prefix + '>';

  return block.children
    .map((child) => {
      if (child.type === 'quote') {
        return this.serializeLineQuote(child, quotePrefix);
      }

      if (child.type === 'paragraph') {
        return quotePrefix + ' ' + this.serializeInline(child.children);
      }

      return '';
    })
    .join('\n');
}
