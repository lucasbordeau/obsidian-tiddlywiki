import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';
import { matchTiddlyWikiComment } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiComment';
import { matchTiddlyWikiInlineCode } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiInlineCode';
import { matchTiddlyWikiWikiLink } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiWikiLink';
import { matchTiddlyWikiImagePrefix } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiImagePrefix';
import { matchTiddlyWikiFilteredTransclusion } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiFilteredTransclusion';
import { matchTiddlyWikiTransclusion } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiTransclusion';
import { matchTiddlyWikiMacroCall } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiMacroCall';
import { matchTiddlyWikiHtmlInline } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiHtmlInline';
import { matchTiddlyWikiStyledInline } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiStyledInline';
import { matchTiddlyWikiConditionalInline } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiConditionalInline';
import { matchTiddlyWikiVariableDisplay } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiVariableDisplay';
import { matchTiddlyWikiDash } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiDash';
import { matchTiddlyWikiSystemLink } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiSystemLink';
import { matchTiddlyWikiEntity } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiEntity';
import { matchTiddlyWikiSuppressedLink } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiSuppressedLink';
import { matchTiddlyWikiExternalLink } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiExternalLink';
import { matchTiddlyWikiFormatting } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiFormatting';
import { matchTiddlyWikiSoftBreak } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiSoftBreak';

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
