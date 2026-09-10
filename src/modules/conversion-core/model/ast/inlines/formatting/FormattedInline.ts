import type { InlineNode } from '../InlineNode';

export type FormattedInline = {
  type:
    | 'strong'
    | 'emphasis'
    | 'underline'
    | 'strike'
    | 'highlight'
    | 'superscript'
    | 'subscript';
  children: InlineNode[];
};
