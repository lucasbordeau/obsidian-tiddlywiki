import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';

export function stripSourceRanges(blocks: BlockNode[]): unknown {
  return JSON.parse(
    JSON.stringify(blocks, (key, value: unknown) =>
      key === 'range' ? undefined : value,
    ),
  );
}
