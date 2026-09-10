import type { InlineNode } from '../InlineNode';

export type LinkInline = {
  type: 'link';
  target: string;
  label: InlineNode[];
  external: boolean;
  title?: string;
};
