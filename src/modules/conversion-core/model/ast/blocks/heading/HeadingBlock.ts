import type { InlineNode } from '../../inlines/InlineNode';

export type HeadingBlock = {
  type: 'heading';
  level: number;
  children: InlineNode[];
};
