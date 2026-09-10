import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../context/types/TiddlyWikiParsingContext';
import { matchTiddlyWikiComment } from './comments/matchTiddlyWikiComment';
import { matchTiddlyWikiInlineCode } from './code/matchTiddlyWikiInlineCode';
import { matchTiddlyWikiWikiLink } from './links/matchTiddlyWikiWikiLink';
import { matchTiddlyWikiImagePrefix } from './images/matchTiddlyWikiImagePrefix';
import { matchTiddlyWikiFilteredTransclusion } from './transclusions/matchTiddlyWikiFilteredTransclusion';
import { matchTiddlyWikiTransclusion } from './transclusions/matchTiddlyWikiTransclusion';
import { matchTiddlyWikiMacroCall } from './transclusions/matchTiddlyWikiMacroCall';
import { matchTiddlyWikiHtmlInline } from './html/matchTiddlyWikiHtmlInline';
import { matchTiddlyWikiStyledInline } from './formatting/matchTiddlyWikiStyledInline';
import { matchTiddlyWikiConditionalInline } from './transclusions/matchTiddlyWikiConditionalInline';
import { matchTiddlyWikiVariableDisplay } from './transclusions/matchTiddlyWikiVariableDisplay';
import { matchTiddlyWikiDash } from './text/matchTiddlyWikiDash';
import { matchTiddlyWikiSystemLink } from './links/matchTiddlyWikiSystemLink';
import { matchTiddlyWikiEntity } from './text/matchTiddlyWikiEntity';
import { matchTiddlyWikiSuppressedLink } from './links/matchTiddlyWikiSuppressedLink';
import { matchTiddlyWikiExternalLink } from './links/matchTiddlyWikiExternalLink';
import { matchTiddlyWikiFormatting } from './formatting/matchTiddlyWikiFormatting';
import { matchTiddlyWikiSoftBreak } from './text/matchTiddlyWikiSoftBreak';

export function matchTiddlyWikiInline(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const matched =
    matchTiddlyWikiComment.call(this, start, end, depth) ??
    matchTiddlyWikiInlineCode.call(this, start, end, depth) ??
    matchTiddlyWikiWikiLink.call(this, start, end, depth) ??
    matchTiddlyWikiImagePrefix.call(this, start, end, depth) ??
    matchTiddlyWikiFilteredTransclusion.call(this, start, end, depth) ??
    matchTiddlyWikiTransclusion.call(this, start, end, depth) ??
    matchTiddlyWikiMacroCall.call(this, start, end, depth) ??
    matchTiddlyWikiHtmlInline.call(this, start, end, depth) ??
    matchTiddlyWikiStyledInline.call(this, start, end, depth) ??
    matchTiddlyWikiConditionalInline.call(this, start, end, depth) ??
    matchTiddlyWikiVariableDisplay.call(this, start, end, depth) ??
    matchTiddlyWikiDash.call(this, start, end, depth) ??
    matchTiddlyWikiSystemLink.call(this, start, end, depth) ??
    matchTiddlyWikiEntity.call(this, start, end, depth) ??
    matchTiddlyWikiSuppressedLink.call(this, start, end, depth) ??
    matchTiddlyWikiExternalLink.call(this, start, end, depth) ??
    matchTiddlyWikiFormatting.call(this, start, end, depth) ??
    matchTiddlyWikiSoftBreak.call(this, start, end, depth);

  return matched;
}
