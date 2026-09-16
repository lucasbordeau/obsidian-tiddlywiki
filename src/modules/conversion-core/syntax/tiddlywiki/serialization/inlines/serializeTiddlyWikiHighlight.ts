import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiHighlight(
  this: TiddlyWikiSerializationContext,
  node: Extract<InlineNode, { children: InlineNode[] }>,
): string {
  const nativeHighlight =
    this.document.dialect === 'tiddlywiki' &&
    node.range &&
    this.document.source.startsWith('@@', node.range.start);

  if (nativeHighlight) {
    return '@@' + this.serializeInline(node.children) + '@@';
  }

  return '<mark>' + this.serializeInline(node.children) + '</mark>';
}
