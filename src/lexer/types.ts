export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingToken = {
  type: 'heading';
  level: HeadingLevel;
  rawText: string;
};

export type ParagraphToken = {
  type: 'paragraph';
  rawText: string;
};

export type BlankLineToken = {
  type: 'blank';
};

export type BlockToken = HeadingToken | ParagraphToken | BlankLineToken;
