import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiInlines(
  this: TiddlyWikiSerializationContext,
  children: InlineNode[],
): string {
  return children.map((child) => this.serializeInlineNode(child)).join('');
}
