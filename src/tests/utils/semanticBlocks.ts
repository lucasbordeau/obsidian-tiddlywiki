import { BlockNode } from '../../modules/conversion-core/types/BlockNode';
import { isRecord } from '../../modules/conversion-core/utils/isRecord';

export function semanticBlocks(blocks: BlockNode[]): unknown {
  function normalize(value: unknown): unknown {
    if (Array.isArray(value)) {
      const normalizedNodes: unknown[] = [];
      for (const entry of value) {
        const node = normalize(entry);
        const previous = normalizedNodes[normalizedNodes.length - 1];
        const adjacentText =
          isRecord(previous) &&
          isRecord(node) &&
          previous.type === 'text' &&
          node.type === 'text';
        if (adjacentText && isRecord(previous) && isRecord(node)) {
          previous.value = String(previous.value) + String(node.value);
        } else {
          normalizedNodes.push(node);
        }
      }
      return normalizedNodes;
    }
    if (!isRecord(value)) {
      return value;
    }
    if (value.type === 'break' && value.hard === false) {
      return { type: 'text', value: '\n' };
    }
    const result: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(value)) {
      if (key !== 'range' && field !== undefined) {
        result[key] = normalize(field);
      }
    }
    return result;
  }
  return normalize(blocks);
}
