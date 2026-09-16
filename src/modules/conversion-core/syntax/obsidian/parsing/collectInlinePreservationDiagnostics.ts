import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';
import { recordPreservedSyntaxDiagnostic } from '@/modules/conversion-core/syntax/obsidian/parsing/recordPreservedSyntaxDiagnostic';

export function collectInlinePreservationDiagnostics(
  nodes: InlineNode[],
  context: ParseContext,
  range: SourceRange,
): void {
  for (const node of nodes) {
    if ('children' in node) {
      collectInlinePreservationDiagnostics(node.children, context, range);
    }

    if (node.type === 'link') {
      collectInlinePreservationDiagnostics(node.label, context, range);
    }

    recordPreservedSyntaxDiagnostic(node, context, range);
  }
}
