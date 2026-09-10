import type { TiddlyWikiFormattingType } from '../types/TiddlyWikiFormattingType';

export const TIDDLYWIKI_FORMATTING_MARKERS: [
  string,
  TiddlyWikiFormattingType,
][] = [
  ["''", 'strong'],
  ['//', 'emphasis'],
  ['__', 'underline'],
  ['~~', 'strike'],
  ['^^', 'superscript'],
  [',,', 'subscript'],
  ['@@', 'highlight'],
];
