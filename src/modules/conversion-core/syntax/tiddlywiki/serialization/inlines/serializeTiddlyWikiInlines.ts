import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiInlines(
  this: TiddlyWikiSerializationContext,
  children: InlineNode[],
): string {
  return children.map((child) => this.serializeInlineNode(child)).join('');
}
