import { BlockNode } from './BlockNode';
import { SourceRange } from './SourceRange';

export type ListItem = {
  blocks: BlockNode[];
  checked?: boolean;
  taskMarker?: string;
  range?: SourceRange;
};
