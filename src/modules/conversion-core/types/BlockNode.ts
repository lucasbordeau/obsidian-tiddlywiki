import { Dialect } from './Dialect';
import { InlineNode } from './InlineNode';
import { ListItem } from './ListItem';
import { SourceRange } from './SourceRange';

export type BlockNode = { range?: SourceRange } & (
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'code'; value: string; language: string }
  | {
      type: 'quote';
      children: BlockNode[];
      callout?: {
        type: string;
        title: string;
        titleNodes?: InlineNode[];
        fold?: '+' | '-';
      };
    }
  | { type: 'list'; ordered: boolean; start: number; children: ListItem[] }
  | {
      type: 'table';
      header: InlineNode[][];
      rows: InlineNode[][][];
      alignments: ('left' | 'right' | 'center' | null)[];
    }
  | { type: 'thematicBreak' }
  | { type: 'math'; value: string }
  | { type: 'footnoteDefinition'; identifier: string; children: BlockNode[] }
  | { type: 'raw'; value: string; dialect: Dialect; reason: string }
);
