import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export function getPlainLinkLabel(label: InlineNode[]): string | undefined {
  const onlyText = label.every((node) => node.type === 'text');

  if (!onlyText) {
    return undefined;
  }

  return label.map((node) => (node.type === 'text' ? node.value : '')).join('');
}
