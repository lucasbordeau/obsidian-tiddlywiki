import type { ParagraphBlock } from './ParagraphBlock';
import type { HeadingBlock } from './HeadingBlock';
import type { CodeBlock } from './CodeBlock';
import type { QuoteBlock } from './QuoteBlock';
import type { ListBlock } from './ListBlock';
import type { TableBlock } from './TableBlock';
import type { ThematicBreakBlock } from './ThematicBreakBlock';
import type { MathBlock } from './MathBlock';
import type { FootnoteDefinitionBlock } from './FootnoteDefinitionBlock';
import type { RawBlock } from './RawBlock';
import type { SourceRange } from '../SourceRange';

export type BlockNode = { range?: SourceRange } & (
  | ParagraphBlock
  | HeadingBlock
  | CodeBlock
  | QuoteBlock
  | ListBlock
  | TableBlock
  | ThematicBreakBlock
  | MathBlock
  | FootnoteDefinitionBlock
  | RawBlock
);
