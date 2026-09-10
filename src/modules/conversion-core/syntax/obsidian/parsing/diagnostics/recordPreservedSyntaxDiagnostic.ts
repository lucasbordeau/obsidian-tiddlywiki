import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { ParseContext } from '../../types/parsing/ParseContext';
import type { SourceRange } from '../../../../model/source/SourceRange';

export function recordPreservedSyntaxDiagnostic(
  node: InlineNode | BlockNode,
  context: ParseContext,
  range: SourceRange,
): void {
  if (node.type !== 'raw' || node.dialect !== 'obsidian') {
    return;
  }

  const categories: Record<string, { code: string; message: string }> = {
    'Obsidian inline footnote': {
      code: 'PRESERVED_INLINE_FOOTNOTE',
      message: 'Inline footnote is retained in its original Obsidian syntax.',
    },
    'Obsidian web embed': {
      code: 'PRESERVED_WEB_EMBED',
      message: 'Web embed is retained in its Obsidian source representation.',
    },
    'Obsidian iframe embed': {
      code: 'PRESERVED_IFRAME_EMBED',
      message: 'Iframe embed is retained in its original HTML syntax.',
    },
  };

  const diagnostic = categories[node.reason];

  if (diagnostic) {
    context.diagnostics.push({ ...diagnostic, severity: 'warning', range });
  }
}
