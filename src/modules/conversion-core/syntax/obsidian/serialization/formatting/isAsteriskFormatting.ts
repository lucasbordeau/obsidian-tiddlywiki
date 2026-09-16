import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export function isAsteriskFormatting(node: InlineNode | undefined): boolean {
  return node?.type === 'strong' || node?.type === 'emphasis';
}
