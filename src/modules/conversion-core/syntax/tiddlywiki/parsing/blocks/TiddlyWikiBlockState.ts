import { TiddlyWikiSourceLine } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiSourceLine';

export type TiddlyWikiBlockState = {
  lineIndex: number;
  endLine: number;
  line: TiddlyWikiSourceLine;
  start: number;
  text: string;
};
