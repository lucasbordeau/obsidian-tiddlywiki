import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { decodePreservedSource } from '../../../../preservation/source/decodePreservedSource';

export function createRawInline(value: string, reason: string): InlineNode {
  const preserved = decodePreservedSource(value);

  if (preserved) {
    return { type: 'raw', ...preserved };
  }

  return { type: 'raw', value, dialect: 'obsidian', reason };
}
