import { scanFence } from './code/scanFence';
import { scanComment } from './comments/scanComment';
import { scanInlineCode } from './code/scanInlineCode';
import { scanWikiReference } from './links/scanWikiReference';
import { scanTiddlyWikiImage } from './embeds/scanTiddlyWikiImage';
import { scanMarkdownReference } from './links/scanMarkdownReference';
import { scanTransclusion } from './transclusions/scanTransclusion';
import { scanMacro } from './macros/scanMacro';
import { scanHtmlTag } from './html/scanHtmlTag';
import { scanEscape } from './escaping/scanEscape';
import { scanBlockMarker } from './structure/scanBlockMarker';
import { scanWhitespace } from './text/scanWhitespace';
import { scanDelimiter } from './structure/scanDelimiter';
import { scanPlainText } from './text/scanPlainText';
import type { LexingContext } from '../context/LexingContext';
import type { TokenMatch } from '../matches/TokenMatch';

export function scanNextToken(context: LexingContext): TokenMatch {
  const matchedToken =
    scanFence(context) ??
    scanComment(context) ??
    scanInlineCode(context) ??
    scanWikiReference(context) ??
    scanTiddlyWikiImage(context) ??
    scanMarkdownReference(context) ??
    scanTransclusion(context) ??
    scanMacro(context) ??
    scanHtmlTag(context) ??
    scanEscape(context) ??
    scanBlockMarker(context) ??
    scanWhitespace(context) ??
    scanDelimiter(context) ??
    scanPlainText(context);

  return matchedToken;
}
