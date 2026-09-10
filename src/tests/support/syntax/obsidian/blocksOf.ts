import { parseObsidian } from '../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { BlockNode } from '../../../../modules/conversion-core/model/ast/blocks/BlockNode';

export function blocksOf(source: string): BlockNode[] {
  return JSON.parse(
    JSON.stringify(parseObsidian(source).blocks, (key, value: unknown) =>
      key === 'range' ? undefined : value,
    ),
  ) as BlockNode[];
}
