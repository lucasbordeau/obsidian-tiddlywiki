import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { ParseContext } from '../../types/parsing/ParseContext';
import type { SourceRange } from '../../../../model/source/SourceRange';
import { recordPreservedSyntaxDiagnostic } from './recordPreservedSyntaxDiagnostic';

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
