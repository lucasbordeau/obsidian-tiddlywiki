import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';

export type FootnoteDefinitionBlock = {
  type: 'footnoteDefinition';
  identifier: string;
  children: BlockNode[];
};
