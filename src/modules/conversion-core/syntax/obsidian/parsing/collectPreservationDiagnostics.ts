import type { BlockNode } from '../../../model/blocks/BlockNode';
import type { ParseContext } from '../types/ParseContext';
import type { SourceRange } from '../../../model/SourceRange';
import { recordPreservedSyntaxDiagnostic } from './recordPreservedSyntaxDiagnostic';
import { collectInlinePreservationDiagnostics } from './collectInlinePreservationDiagnostics';

export function collectPreservationDiagnostics(
  blocks: BlockNode[],
  context: ParseContext,
  parentRange?: SourceRange,
): void {
  for (const block of blocks) {
    const range = block.range ??
      parentRange ?? { start: 0, end: context.source.length };

    recordPreservedSyntaxDiagnostic(block, context, range);

    if (block.type === 'paragraph' || block.type === 'heading') {
      collectInlinePreservationDiagnostics(block.children, context, range);
    }

    if (block.type === 'quote') {
      collectInlinePreservationDiagnostics(
        block.callout?.titleNodes ?? [],
        context,
        range,
      );

      collectPreservationDiagnostics(block.children, context, range);
    }

    if (block.type === 'footnoteDefinition') {
      collectPreservationDiagnostics(block.children, context, range);
    }

    if (block.type === 'list') {
      for (const entry of block.children) {
        collectPreservationDiagnostics(entry.blocks, context, range);
      }
    }

    if (block.type === 'table') {
      for (const cell of block.header) {
        collectInlinePreservationDiagnostics(cell, context, range);
      }

      for (const tableRow of block.rows) {
        for (const cell of tableRow) {
          collectInlinePreservationDiagnostics(cell, context, range);
        }
      }
    }
  }
}
