import type { TextInline } from './text/TextInline';
import type { FormattedInline } from './formatting/FormattedInline';
import type { LinkInline } from './links/LinkInline';
import type { EmbedInline } from './embeds/EmbedInline';
import type { BreakInline } from './breaks/BreakInline';
import type { MathInline } from './math/MathInline';
import type { FootnoteReferenceInline } from './footnotes/FootnoteReferenceInline';
import type { RawInline } from './preservation/RawInline';
import type { SourceRange } from '../../source/SourceRange';

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
