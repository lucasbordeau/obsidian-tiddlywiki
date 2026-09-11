import type { BlockNode } from '../../../../model/blocks/BlockNode';
import { getLongestDelimiterRun } from '../getLongestDelimiterRun';

export function renderCode(
  block: Extract<BlockNode, { type: 'code' }>,
): string {
  const fenceCharacter = block.language.includes('`') ? '~' : '`';

  const fence = fenceCharacter.repeat(
    Math.max(3, getLongestDelimiterRun(block.value, fenceCharacter) + 1),
  );

  return `${fence}${block.language}\n${block.value}\n${fence}`;
}
