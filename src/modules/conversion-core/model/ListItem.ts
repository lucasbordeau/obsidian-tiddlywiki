import type { BlockNode } from './blocks/BlockNode';
import type { SourceRange } from './SourceRange';

export type ListItem = {
  blocks: BlockNode[];
  checked?: boolean;
  taskMarker?: string;
  range?: SourceRange;
};
