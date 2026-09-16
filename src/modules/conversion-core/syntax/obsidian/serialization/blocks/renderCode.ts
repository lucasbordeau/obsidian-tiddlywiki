import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { getLongestDelimiterRun } from '@/modules/conversion-core/syntax/obsidian/serialization/getLongestDelimiterRun';

export function renderCode(
  block: Extract<BlockNode, { type: 'code' }>,
): string {
  const fenceCharacter = block.language.includes('`') ? '~' : '`';

  const fence = fenceCharacter.repeat(
    Math.max(3, getLongestDelimiterRun(block.value, fenceCharacter) + 1),
  );

  return `${fence}${block.language}\n${block.value}\n${fence}`;
}
