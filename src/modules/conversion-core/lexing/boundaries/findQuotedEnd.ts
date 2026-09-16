/**
 * Optional recovery behavior for a quote-aware closing-delimiter search.
 * A TiddlyWiki macro protects `[[...]]` parameters; an HTML tag does not.
 * Macro and HTML scanners ask for `-1` when their closer is absent, while
 * callers that omit `missingEnd` keep the existing source-end fallback.
 * HTML scanning stops at a new unquoted `<`, making malformed opener recovery
 * local. TiddlyWiki scans protect dynamic attribute expressions first.
 *
 * ```ts
 * const macroBoundary: QuotedEndOptions = {
 *   protectBracketedParameters: true,
 *   missingEnd: -1,
 * };
 * const obsidianHtmlBoundary: QuotedEndOptions = {
 *   stopAtUnquotedOpeningAngle: true,
 *   missingEnd: -1,
 * };
 * const tiddlyWikiHtmlBoundary: QuotedEndOptions = {
 *   protectTiddlyWikiAttributeExpressions: true,
 *   stopAtUnquotedOpeningAngle: true,
 *   missingEnd: -1,
 * };
 * ```
 */
type QuotedEndOptions = {
  protectBracketedParameters?: boolean;
  protectTiddlyWikiAttributeExpressions?: boolean;
  stopAtUnquotedOpeningAngle?: boolean;
  missingEnd?: number;
};

/**
 * Skip a complete unquoted WikiText macro or transclusion attribute value.
 * A macro's bracketed parameter can contain `>>`; filtered transclusions can
 * contain `<size>` variables. Return undefined for other characters, and -1
 * for an unfinished dynamic value so its outer tag can recover.
 *
 * ```ts
 * const macro = '<<foo [[a >> b]]>>';
 * findTiddlyWikiAttributeExpressionEnd(macro, 0); // macro.length
 * const filtered = '{{{ [<size>multiply[2]] }}}';
 * findTiddlyWikiAttributeExpressionEnd(filtered, 0); // filtered.length
 * findTiddlyWikiAttributeExpressionEnd('<<unfinished', 0); // -1
 * findTiddlyWikiAttributeExpressionEnd('class=', 0); // undefined
 * ```
 */
function findTiddlyWikiAttributeExpressionEnd(
  source: string,
  cursor: number,
): number | undefined {
  let opening = '';
  let closing = '';

  if (source.startsWith('<<', cursor) && !source.startsWith('<<<', cursor)) {
    opening = '<<';
    closing = '>>';
  } else if (source.startsWith('{{{', cursor)) {
    opening = '{{{';
    closing = '}}}';
  } else if (source.startsWith('{{', cursor)) {
    opening = '{{';
    closing = '}}';
  }

  if (!opening) {
    return undefined;
  }

  const isMacro = opening === '<<';

  return findQuotedEnd(source, cursor + opening.length, closing, {
    protectBracketedParameters: isMacro,
    stopAtUnquotedOpeningAngle: isMacro,
    missingEnd: -1,
  });
}

/**
 * Find `closing` outside single, double, or triple-double-quoted segments.
 * TiddlyWiki macro calls can additionally protect a `[[...]]` parameter, whose
 * contents may themselves contain `>>`. The normal fallback is source end so
 * existing image callers retain unfinished source. Macro and HTML scanning use
 * `-1` on failure so they can leave a malformed opener as plain text.
 *
 * ```ts
 * findQuotedEnd('<a title=">">', 2, '>'); // 13, HTML in either dialect
 * findQuotedEnd('<<foo [[a >> b]]>>', 2, '>>', {
 *   protectBracketedParameters: true,
 *   missingEnd: -1,
 * }); // 18, after the TiddlyWiki macro closer
 * findQuotedEnd('<<unfinished', 2, '>>', { missingEnd: -1 }); // -1
 * findQuotedEnd('<a <a', 2, '>', {
 *   stopAtUnquotedOpeningAngle: true,
 *   missingEnd: -1,
 * }); // -1, stop at the next malformed opener
 * findQuotedEnd('<a title="<a">', 2, '>', {
 *   stopAtUnquotedOpeningAngle: true,
 *   missingEnd: -1,
 * }); // 14, the quoted `<a` stays inside the tag
 * const widget = '<$transclude $tiddler=<<target>>/>';
 * findQuotedEnd(widget, '<$transclude'.length, '>', {
 *   protectTiddlyWikiAttributeExpressions: true,
 *   stopAtUnquotedOpeningAngle: true,
 *   missingEnd: -1,
 * }); // widget.length, after the macro attribute and tag closer
 * ```
 */
export function findQuotedEnd(
  source: string,
  start: number,
  closing: string,
  options: QuotedEndOptions = {},
): number {
  const {
    protectBracketedParameters = false,
    protectTiddlyWikiAttributeExpressions = false,
    stopAtUnquotedOpeningAngle = false,
    missingEnd = source.length,
  } = options;

  let cursor = start;
  let quote = '';

  while (cursor < source.length) {
    if (quote) {
      if (source.startsWith(quote, cursor)) {
        cursor += quote.length;
        quote = '';
      } else {
        cursor++;
      }

      continue;
    }

    const dynamicAttributeEnd = protectTiddlyWikiAttributeExpressions
      ? findTiddlyWikiAttributeExpressionEnd(source, cursor)
      : undefined;

    if (dynamicAttributeEnd !== undefined) {
      if (dynamicAttributeEnd < 0) {
        return missingEnd;
      }

      cursor = dynamicAttributeEnd;

      continue;
    }

    if (stopAtUnquotedOpeningAngle && source[cursor] === '<') {
      return missingEnd;
    }

    if (source.startsWith(closing, cursor)) {
      return cursor + closing.length;
    }

    if (protectBracketedParameters && source.startsWith('[[', cursor)) {
      quote = ']]';
    } else if (source.startsWith('"""', cursor)) {
      quote = '"""';
    } else if (
      protectTiddlyWikiAttributeExpressions &&
      source[cursor] === '`'
    ) {
      quote = '`';
    } else if (source[cursor] === '"' || source[cursor] === "'") {
      quote = source[cursor];
    }

    cursor += quote.length || 1;
  }

  return missingEnd;
}
