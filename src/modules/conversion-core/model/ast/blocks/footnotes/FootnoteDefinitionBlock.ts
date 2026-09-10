import type { BlockNode } from '../BlockNode';

export type FootnoteDefinitionBlock = {
  type: 'footnoteDefinition';
  identifier: string;
  children: BlockNode[];
};
