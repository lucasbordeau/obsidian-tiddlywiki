import type { InlineNode } from '../inlines/InlineNode';

export type ParagraphBlock = { type: 'paragraph'; children: InlineNode[] };
