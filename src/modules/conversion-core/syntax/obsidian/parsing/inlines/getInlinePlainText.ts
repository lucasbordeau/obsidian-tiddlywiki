import type { InlineNode } from '../../../../model/inlines/InlineNode';

export function getInlinePlainText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if ('children' in node) {
        return getInlinePlainText(node.children);
      }

      if (node.type === 'link') {
        return getInlinePlainText(node.label);
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
