import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import { longestRun } from '../code/longestRun';

export function renderCode(
  block: Extract<BlockNode, { type: 'code' }>,
): string {
  const fenceCharacter = block.language.includes('`') ? '~' : '`';

  const fence = fenceCharacter.repeat(
    Math.max(3, longestRun(block.value, fenceCharacter) + 1),
  );

  return `${fence}${block.language}\n${block.value}\n${fence}`;
}
