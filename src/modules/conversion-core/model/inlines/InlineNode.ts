import type { TextInline } from './TextInline';
import type { FormattedInline } from './FormattedInline';
import type { LinkInline } from './LinkInline';
import type { EmbedInline } from './EmbedInline';
import type { BreakInline } from './BreakInline';
import type { MathInline } from './MathInline';
import type { FootnoteReferenceInline } from './FootnoteReferenceInline';
import type { RawInline } from './RawInline';
import type { SourceRange } from '../SourceRange';

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
