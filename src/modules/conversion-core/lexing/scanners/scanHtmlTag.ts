import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findQuotedEnd } from '@/modules/conversion-core/lexing/boundaries/findQuotedEnd';

// Match CommonMark's ASCII control exclusion for angle autolinks.
// eslint-disable-next-line no-control-regex
const ANGLE_AUTOLINK = /^<([^<>\x00-\x20]+)>/;
// eslint-disable-next-line no-control-regex
const PROTOCOL_AUTOLINK = /^[a-z][a-z\d+.-]{1,31}:[^<>\x00-\x20]*$/i;

const EMAIL_AUTOLINK =
  /^[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i;

const UNSAFE_PROTOCOL = /^(?:vbscript|javascript|file|data):/i;
const PERMITTED_DATA_IMAGE = /^data:image\/(?:gif|png|jpeg|webp);/i;

/**
 * Match the angle form of a Markdown link before checking for an HTML tag.
 * Protocol and email forms follow Markdown-it's autolink shape. Protocols
 * rejected by its default link validator are also rejected here.
 *
 * ```ts
 * findMarkdownAutolinkEnd('<https://example.org> [[Page]]', 0); // 21
 * findMarkdownAutolinkEnd('<person@example.org>', 0); // 20
 * const source = 'Visit <https://example.org>';
 * findMarkdownAutolinkEnd(source.slice(6), 6); // 27, absolute end offset
 * findMarkdownAutolinkEnd('<em>hello</em>', 0); // undefined
 * ```
 */
function findMarkdownAutolinkEnd(
  rest: string,
  cursor: number,
): number | undefined {
  if (rest[0] !== '<') {
    return undefined;
  }

  const angleAutolink = ANGLE_AUTOLINK.exec(rest);

  if (!angleAutolink) {
    return undefined;
  }

  const candidate = angleAutolink[1];
  const isProtocol = PROTOCOL_AUTOLINK.test(candidate);

  const isSafeProtocol =
    !UNSAFE_PROTOCOL.test(candidate) || PERMITTED_DATA_IMAGE.test(candidate);

  const isEmail = EMAIL_AUTOLINK.test(candidate);

  if (isEmail || (isProtocol && isSafeProtocol)) {
    return cursor + angleAutolink[0].length;
  }

  return undefined;
}

/**
 * Classify Obsidian angle autolinks before ordinary HTML tags. A `$` in an
 * HTML tag name marks the token as a TiddlyWiki widget. Quoted `>` characters
 * stay inside their attribute; an unfinished tag leaves following syntax free.
 *
 * ```ts
 * lexSource('<https://example.org> <person@example.org>', 'obsidian')
 *   .filter((token) => token.kind === 'link')
 *   .map((token) => token.raw); // ['<https://example.org>', '<person@example.org>']
 * lexSource('<em>hi</em>', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['html', '<em>'], ['text', 'hi'], ['html', '</em>']]
 * lexSource('<$text text="hi"/>', 'tiddlywiki')[0];
 * // { kind: 'widget', range: { start: 0, end: 18 }, raw: '<$text text="hi"/>' }
 * const widget = '<$transclude $tiddler=<<target>>/>';
 * lexSource(widget, 'tiddlywiki')[0];
 * // { kind: 'widget', range: { start: 0, end: 34 }, raw: widget }
 * lexSource('<tag attr="unfinished\n[x](foo)', 'obsidian')
 *   .find((token) => token.kind === 'link');
 * // { kind: 'link', range: { start: 22, end: 30 }, raw: '[x](foo)' }
 * lexSource('<a <a <a \n[x](foo)', 'obsidian')
 *   .find((token) => token.kind === 'link');
 * // { kind: 'link', range: { start: 10, end: 18 }, raw: '[x](foo)' }
 * ```
 */
export function scanHtmlTag(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor, rest } = context;

  const autolinkEnd =
    dialect === 'obsidian' ? findMarkdownAutolinkEnd(rest, cursor) : undefined;

  if (autolinkEnd !== undefined) {
    return { kind: 'link', end: autolinkEnd };
  }

  const htmlTag = /^<\/?[\w$][\w$:-]*(?=\s|>|\/>)/.exec(rest);

  if (htmlTag) {
    const closingEnd = findQuotedEnd(source, cursor + htmlTag[0].length, '>', {
      missingEnd: -1,
      stopAtUnquotedOpeningAngle: true,
      protectTiddlyWikiAttributeExpressions: dialect === 'tiddlywiki',
    });

    if (closingEnd < 0) {
      return { kind: 'text', end: cursor + htmlTag[0].length };
    }

    return {
      kind: htmlTag[0].includes('$') ? 'widget' : 'html',
      end: closingEnd,
    };
  }

  return undefined;
}
