import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';

export function plainLabel(label: InlineNode[]): string | undefined {
  const onlyText = label.every((node) => node.type === 'text');

  if (!onlyText) {
    return undefined;
  }

  return label.map((node) => (node.type === 'text' ? node.value : '')).join('');
}
