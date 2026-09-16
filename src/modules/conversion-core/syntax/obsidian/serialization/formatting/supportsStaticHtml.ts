import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export function supportsStaticHtml(node: InlineNode): boolean {
  if ('children' in node) {
    return node.children.every(supportsStaticHtml);
  }

  if (node.type === 'link') {
    return node.label.every(supportsStaticHtml);
  }

  return (
    node.type === 'text' ||
    node.type === 'code' ||
    (node.type === 'embed' && node.kind === 'image') ||
    (node.type === 'break' && node.hard)
  );
}
