import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';
import { matchTiddlyWikiComment } from './matchTiddlyWikiComment';
import { matchTiddlyWikiInlineCode } from './matchTiddlyWikiInlineCode';
import { matchTiddlyWikiWikiLink } from './matchTiddlyWikiWikiLink';
import { matchTiddlyWikiImagePrefix } from './matchTiddlyWikiImagePrefix';
import { matchTiddlyWikiFilteredTransclusion } from './matchTiddlyWikiFilteredTransclusion';
import { matchTiddlyWikiTransclusion } from './matchTiddlyWikiTransclusion';
import { matchTiddlyWikiMacroCall } from './matchTiddlyWikiMacroCall';
import { matchTiddlyWikiHtmlInline } from './matchTiddlyWikiHtmlInline';
import { matchTiddlyWikiStyledInline } from './matchTiddlyWikiStyledInline';
import { matchTiddlyWikiConditionalInline } from './matchTiddlyWikiConditionalInline';
import { matchTiddlyWikiVariableDisplay } from './matchTiddlyWikiVariableDisplay';
import { matchTiddlyWikiDash } from './matchTiddlyWikiDash';
import { matchTiddlyWikiSystemLink } from './matchTiddlyWikiSystemLink';
import { matchTiddlyWikiEntity } from './matchTiddlyWikiEntity';
import { matchTiddlyWikiSuppressedLink } from './matchTiddlyWikiSuppressedLink';
import { matchTiddlyWikiExternalLink } from './matchTiddlyWikiExternalLink';
import { matchTiddlyWikiFormatting } from './matchTiddlyWikiFormatting';
import { matchTiddlyWikiSoftBreak } from './matchTiddlyWikiSoftBreak';

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
