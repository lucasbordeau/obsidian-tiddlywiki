import type { TiddlyWikiSourceLine } from '../../types/TiddlyWikiSourceLine';

export type TiddlyWikiBlockState = {
  lineIndex: number;
  endLine: number;
  line: TiddlyWikiSourceLine;
  start: number;
  text: string;
};
