import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

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
