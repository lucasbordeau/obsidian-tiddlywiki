import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/escapeTiddlyWikiText';

export function serializeTiddlyWikiInlineCode(
  this: TiddlyWikiSerializationContext,
  node: Extract<InlineNode, { type: 'text' | 'code' }>,
): string {
  if (!node.value.includes('`')) {
    return '`' + node.value + '`';
  }

  if (!node.value.includes('``')) {
    return '``' + node.value + '``';
  }

  return '<code>' + escapeTiddlyWikiText(node.value) + '</code>';
}
