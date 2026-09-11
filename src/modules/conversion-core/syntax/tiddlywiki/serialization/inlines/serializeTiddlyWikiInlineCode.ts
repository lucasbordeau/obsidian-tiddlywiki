import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '../escapeTiddlyWikiText';

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
