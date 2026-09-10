import type { InlineNode } from '../../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiSerializationContext } from '../../context/types/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '../../escaping/escapeTiddlyWikiText';

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
