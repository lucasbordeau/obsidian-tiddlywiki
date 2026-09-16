import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';
import { recordPreservedSyntaxDiagnostic } from '@/modules/conversion-core/syntax/obsidian/parsing/recordPreservedSyntaxDiagnostic';
import { collectInlinePreservationDiagnostics } from '@/modules/conversion-core/syntax/obsidian/parsing/collectInlinePreservationDiagnostics';

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
      for (const listItem of block.children) {
        collectPreservationDiagnostics(listItem.blocks, context, range);
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
