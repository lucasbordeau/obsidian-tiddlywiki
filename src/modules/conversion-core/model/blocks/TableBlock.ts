import { TableAlignment } from '@/modules/conversion-core/model/blocks/TableAlignment';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export type TableBlock = {
  type: 'table';
  header: InlineNode[][];
  rows: InlineNode[][][];
  alignments: TableAlignment[];
};
