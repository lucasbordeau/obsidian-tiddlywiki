import { scanFence } from '@/modules/conversion-core/lexing/scanners/scanFence';
import { scanComment } from '@/modules/conversion-core/lexing/scanners/scanComment';
import { scanInlineCode } from '@/modules/conversion-core/lexing/scanners/scanInlineCode';
import { scanWikiReference } from '@/modules/conversion-core/lexing/scanners/scanWikiReference';
import { scanTiddlyWikiImage } from '@/modules/conversion-core/lexing/scanners/scanTiddlyWikiImage';
import { scanMarkdownReference } from '@/modules/conversion-core/lexing/scanners/scanMarkdownReference';
import { scanTransclusion } from '@/modules/conversion-core/lexing/scanners/scanTransclusion';
import { scanMacro } from '@/modules/conversion-core/lexing/scanners/scanMacro';
import { scanHtmlTag } from '@/modules/conversion-core/lexing/scanners/scanHtmlTag';
import { scanEscape } from '@/modules/conversion-core/lexing/scanners/scanEscape';
import { scanBlockMarker } from '@/modules/conversion-core/lexing/scanners/scanBlockMarker';
import { scanWhitespace } from '@/modules/conversion-core/lexing/scanners/scanWhitespace';
import { scanDelimiter } from '@/modules/conversion-core/lexing/scanners/scanDelimiter';
import { scanPlainText } from '@/modules/conversion-core/lexing/scanners/scanPlainText';
import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

export function scanNextToken(context: LexingContext): TokenMatch {
  const matchedToken =
    // Matches a fenced code region, such as ```ts ... ```.
    scanFence(context) ??
    // Matches a dialect comment, such as <!-- note --> or %% note %%.
    scanComment(context) ??
    // Matches inline literal code, such as `const value = 1`.
    scanInlineCode(context) ??
    // Matches a wiki link or embed, such as [[Note]] or ![[image.png]].
    scanWikiReference(context) ??
    // Matches native TiddlyWiki image syntax, such as [img[photo.png]].
    scanTiddlyWikiImage(context) ??
    // Matches a Markdown link or image, such as [label](target.md).
    scanMarkdownReference(context) ??
    // Matches a TiddlyWiki transclusion, such as {{Reusable Note}}.
    scanTransclusion(context) ??
    // Matches a TiddlyWiki macro call, such as <<greet "Ada">>.
    scanMacro(context) ??
    // Matches an HTML tag or widget, such as <em> or <$list>.
    scanHtmlTag(context) ??
    // Matches a Markdown escape, such as \* for a literal asterisk.
    scanEscape(context) ??
    // Matches a line-opening block marker, such as # in # Heading.
    scanBlockMarker(context) ??
    // Matches consecutive spacing or line breaks, such as two spaces or \n.
    scanWhitespace(context) ??
    // Matches a formatting delimiter, such as **, ==, or ''.
    scanDelimiter(context) ??
    // Consumes remaining text so the lexer advances, such as ordinary words.
    scanPlainText(context);

  return matchedToken;
}
