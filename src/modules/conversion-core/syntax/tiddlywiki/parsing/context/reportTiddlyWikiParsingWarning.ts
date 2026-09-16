import { SourceRange } from '@/modules/conversion-core/model/SourceRange';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function reportTiddlyWikiParsingWarning(
  this: TiddlyWikiParsingContext,
  code: string,
  message: string,
  range: SourceRange,
): void {
  this.diagnostics.push({ code, message, severity: 'warning', range });
}
