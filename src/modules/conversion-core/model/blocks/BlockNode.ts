import { ParagraphBlock } from '@/modules/conversion-core/model/blocks/ParagraphBlock';
import { HeadingBlock } from '@/modules/conversion-core/model/blocks/HeadingBlock';
import { CodeBlock } from '@/modules/conversion-core/model/blocks/CodeBlock';
import { QuoteBlock } from '@/modules/conversion-core/model/blocks/QuoteBlock';
import { ListBlock } from '@/modules/conversion-core/model/blocks/ListBlock';
import { TableBlock } from '@/modules/conversion-core/model/blocks/TableBlock';
import { ThematicBreakBlock } from '@/modules/conversion-core/model/blocks/ThematicBreakBlock';
import { MathBlock } from '@/modules/conversion-core/model/blocks/MathBlock';
import { FootnoteDefinitionBlock } from '@/modules/conversion-core/model/blocks/FootnoteDefinitionBlock';
import { RawBlock } from '@/modules/conversion-core/model/blocks/RawBlock';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

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
