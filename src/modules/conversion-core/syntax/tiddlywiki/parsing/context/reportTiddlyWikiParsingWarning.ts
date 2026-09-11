import type { SourceRange } from '../../../../model/SourceRange';
import type { TiddlyWikiParsingContext } from './TiddlyWikiParsingContext';

export function reportTiddlyWikiParsingWarning(
  this: TiddlyWikiParsingContext,
  code: string,
  message: string,
  range: SourceRange,
): void {
  this.diagnostics.push({ code, message, severity: 'warning', range });
}
