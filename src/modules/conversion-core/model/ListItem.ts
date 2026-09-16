import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

export type ListItem = {
  blocks: BlockNode[];
  checked?: boolean;
  taskMarker?: string;
  range?: SourceRange;
};
