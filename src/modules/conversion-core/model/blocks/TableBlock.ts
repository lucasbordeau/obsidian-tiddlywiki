import type { TableAlignment } from './TableAlignment';
import type { InlineNode } from '../inlines/InlineNode';

export type TableBlock = {
  type: 'table';
  header: InlineNode[][];
  rows: InlineNode[][][];
  alignments: TableAlignment[];
};
