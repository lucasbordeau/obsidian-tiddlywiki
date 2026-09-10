import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiSerializationContext } from '../context/types/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiInlines(
  this: TiddlyWikiSerializationContext,
  children: InlineNode[],
): string {
  return children.map((child) => this.serializeInlineNode(child)).join('');
}
