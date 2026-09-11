import { scanFence } from './scanFence';
import { scanComment } from './scanComment';
import { scanInlineCode } from './scanInlineCode';
import { scanWikiReference } from './scanWikiReference';
import { scanTiddlyWikiImage } from './scanTiddlyWikiImage';
import { scanMarkdownReference } from './scanMarkdownReference';
import { scanTransclusion } from './scanTransclusion';
import { scanMacro } from './scanMacro';
import { scanHtmlTag } from './scanHtmlTag';
import { scanEscape } from './scanEscape';
import { scanBlockMarker } from './scanBlockMarker';
import { scanWhitespace } from './scanWhitespace';
import { scanDelimiter } from './scanDelimiter';
import { scanPlainText } from './scanPlainText';
import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';

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
