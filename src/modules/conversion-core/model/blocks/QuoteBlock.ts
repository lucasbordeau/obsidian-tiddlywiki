import type { Callout } from './Callout';
import type { BlockNode } from './BlockNode';

export type QuoteBlock = {
  type: 'quote';
  children: BlockNode[];
  callout?: Callout;
};
