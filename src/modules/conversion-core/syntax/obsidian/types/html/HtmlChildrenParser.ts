import type { HtmlCursor } from './HtmlCursor';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';

export type HtmlChildrenParser = (
  source: string,
  cursor: HtmlCursor,
  closingTag?: string,
) => InlineNode[] | undefined;
