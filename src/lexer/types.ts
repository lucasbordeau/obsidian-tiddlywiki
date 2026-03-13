export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: InlineToken[] }
  | { type: 'italic'; children: InlineToken[] }
  | { type: 'underline'; children: InlineToken[] }
  | { type: 'inlineCode'; value: string };

export type HeadingToken = {
  type: 'heading';
  level: HeadingLevel;
  children: InlineToken[];
};

export type ParagraphToken = {
  type: 'paragraph';
  children: InlineToken[];
};

export type BlankLineToken = {
  type: 'blank';
};

export type BlockToken = HeadingToken | ParagraphToken | BlankLineToken;
