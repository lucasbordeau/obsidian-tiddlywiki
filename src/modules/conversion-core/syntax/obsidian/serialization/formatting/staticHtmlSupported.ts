import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';

export function staticHtmlSupported(node: InlineNode): boolean {
  if ('children' in node) {
    return node.children.every(staticHtmlSupported);
  }

  if (node.type === 'link') {
    return node.label.every(staticHtmlSupported);
  }

  return (
    node.type === 'text' ||
    node.type === 'code' ||
    (node.type === 'embed' && node.kind === 'image') ||
    (node.type === 'break' && node.hard)
  );
}
