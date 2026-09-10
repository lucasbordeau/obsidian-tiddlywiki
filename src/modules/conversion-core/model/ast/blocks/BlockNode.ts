import type { ParagraphBlock } from './paragraph/ParagraphBlock';
import type { HeadingBlock } from './heading/HeadingBlock';
import type { CodeBlock } from './code/CodeBlock';
import type { QuoteBlock } from './quote/QuoteBlock';
import type { ListBlock } from './list/ListBlock';
import type { TableBlock } from './table/TableBlock';
import type { ThematicBreakBlock } from './separators/ThematicBreakBlock';
import type { MathBlock } from './math/MathBlock';
import type { FootnoteDefinitionBlock } from './footnotes/FootnoteDefinitionBlock';
import type { RawBlock } from './preservation/RawBlock';
import type { SourceRange } from '../../source/SourceRange';

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
