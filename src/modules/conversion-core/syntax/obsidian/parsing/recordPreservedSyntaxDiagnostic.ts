import type { InlineNode } from '../../../model/inlines/InlineNode';
import type { BlockNode } from '../../../model/blocks/BlockNode';
import type { ParseContext } from '../types/ParseContext';
import type { SourceRange } from '../../../model/SourceRange';

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
