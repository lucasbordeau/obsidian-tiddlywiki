import { TiddlyWikiFormattingType } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiFormattingType';

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
