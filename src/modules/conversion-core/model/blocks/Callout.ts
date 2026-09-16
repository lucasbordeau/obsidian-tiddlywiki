import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export type Callout = {
  type: string;
  title: string;
  titleNodes?: InlineNode[];
  fold?: '+' | '-';
};
