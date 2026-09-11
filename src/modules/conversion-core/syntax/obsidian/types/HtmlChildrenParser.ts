import type { HtmlCursor } from './HtmlCursor';
import type { InlineNode } from '../../../model/inlines/InlineNode';

export type HtmlChildrenParser = (
  source: string,
  cursor: HtmlCursor,
  closingTag?: string,
) => InlineNode[] | undefined;
