import type { InlineNode } from '../../../../model/inlines/InlineNode';

export function isAsteriskFormatting(node: InlineNode | undefined): boolean {
  return node?.type === 'strong' || node?.type === 'emphasis';
}
