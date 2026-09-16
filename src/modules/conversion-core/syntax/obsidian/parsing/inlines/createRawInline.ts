import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { decodePreservedSource } from '@/modules/conversion-core/preservation/source/decodePreservedSource';

export function createRawInline(value: string, reason: string): InlineNode {
  const preserved = decodePreservedSource(value);

  if (preserved) {
    return { type: 'raw', ...preserved };
  }

  return { type: 'raw', value, dialect: 'obsidian', reason };
}
