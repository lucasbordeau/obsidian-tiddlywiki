import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export type HeadingBlock = {
  type: 'heading';
  level: number;
  children: InlineNode[];
};
