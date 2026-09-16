import { HtmlCursor } from '@/modules/conversion-core/syntax/obsidian/types/HtmlCursor';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export type HtmlChildrenParser = (
  source: string,
  cursor: HtmlCursor,
  closingTag?: string,
) => InlineNode[] | undefined;
