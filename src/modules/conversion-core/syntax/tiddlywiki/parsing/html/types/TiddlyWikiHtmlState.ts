import type { SourceRange } from '../../../../../model/source/SourceRange';

export type TiddlyWikiHtmlState = {
  start: number;
  end: number;
  tag: string;
  openEnd: number;
  closeStart: number;
  attributes: Record<string, string>;
  range: SourceRange;
};
