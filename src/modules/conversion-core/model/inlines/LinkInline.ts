import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export type LinkInline = {
  type: 'link';
  target: string;
  label: InlineNode[];
  external: boolean;
  title?: string;
};
