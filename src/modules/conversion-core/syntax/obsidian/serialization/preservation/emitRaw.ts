import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { SerializationContext } from '../../types/serialization/SerializationContext';
import { emitDiagnostic } from './emitDiagnostic';
import { encodePreservedSource } from '../../../../preservation/source/encoding/encodePreservedSource';

export function emitRaw(
  node: Extract<InlineNode | BlockNode, { type: 'raw' }>,
  context: SerializationContext,
): string {
  if (node.dialect === 'obsidian') {
    return node.value;
  }

  emitDiagnostic(
    context,
    'PRESERVED_SOURCE',
    `${node.reason} is retained as TiddlyWiki source in a preservation comment.`,
    node.range,
  );

  return encodePreservedSource({
    dialect: node.dialect,
    value: node.value,
    reason: node.reason,
  });
}
