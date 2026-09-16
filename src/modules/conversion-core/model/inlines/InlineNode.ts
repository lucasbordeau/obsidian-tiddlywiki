import { TextInline } from '@/modules/conversion-core/model/inlines/TextInline';
import { FormattedInline } from '@/modules/conversion-core/model/inlines/FormattedInline';
import { LinkInline } from '@/modules/conversion-core/model/inlines/LinkInline';
import { EmbedInline } from '@/modules/conversion-core/model/inlines/EmbedInline';
import { BreakInline } from '@/modules/conversion-core/model/inlines/BreakInline';
import { MathInline } from '@/modules/conversion-core/model/inlines/MathInline';
import { FootnoteReferenceInline } from '@/modules/conversion-core/model/inlines/FootnoteReferenceInline';
import { RawInline } from '@/modules/conversion-core/model/inlines/RawInline';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

export type InlineNode = { range?: SourceRange } & (
  | TextInline
  | FormattedInline
  | LinkInline
  | EmbedInline
  | BreakInline
  | MathInline
  | FootnoteReferenceInline
  | RawInline
);
