import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { getFormattingDepth } from '@/modules/conversion-core/syntax/obsidian/serialization/formatting/getFormattingDepth';
import { supportsStaticHtml } from '@/modules/conversion-core/syntax/obsidian/serialization/formatting/supportsStaticHtml';

export function needsStaticFormatting(node: InlineNode): boolean {
  return getFormattingDepth(node) >= 3 && supportsStaticHtml(node);
}
