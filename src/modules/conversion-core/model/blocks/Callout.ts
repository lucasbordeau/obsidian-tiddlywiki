import type { InlineNode } from '../inlines/InlineNode';

export type Callout = {
  type: string;
  title: string;
  titleNodes?: InlineNode[];
  fold?: '+' | '-';
};
