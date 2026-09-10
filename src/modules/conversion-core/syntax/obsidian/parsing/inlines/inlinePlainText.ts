import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';

export function inlinePlainText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if ('children' in node) {
        return inlinePlainText(node.children);
      }

      if (node.type === 'link') {
        return inlinePlainText(node.label);
      }

      if (node.type === 'embed') {
        return node.alt;
      }

      if (node.type === 'break') {
        return '\n';
      }

      if (node.type === 'footnoteReference') {
        return `[^${node.identifier}]`;
      }

      return node.value;
    })
    .join('');
}
