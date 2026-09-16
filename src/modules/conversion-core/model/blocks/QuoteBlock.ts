import { Callout } from '@/modules/conversion-core/model/blocks/Callout';
import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';

export type QuoteBlock = {
  type: 'quote';
  children: BlockNode[];
  callout?: Callout;
};
