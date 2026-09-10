import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { decodePreservedSource } from '../../../../preservation/source/encoding/decodePreservedSource';

export function rawInline(value: string, reason: string): InlineNode {
  const preserved = decodePreservedSource(value);

  if (preserved) {
    return { type: 'raw', ...preserved };
  }

  return { type: 'raw', value, dialect: 'obsidian', reason };
}
