import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiFormattingType } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiFormattingType';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';
import { parseTiddlyWikiHtmlImage } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlImage';
import { parseTiddlyWikiHtmlInlineCode } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlInlineCode';
import { parseTiddlyWikiHtmlLink } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlLink';
import { parseTiddlyWikiHtmlTransclusion } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlTransclusion';

export function parseTiddlyWikiStaticHtmlInline(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): InlineNode | undefined {
  const opening = /^<([a-z][\w:-]*|\$[\w-]+)\b/i.exec(
    this.source.slice(start, end),
  );

  if (!opening) {
    return undefined;
  }

  const tag = opening[1].toLowerCase();
  const openEnd = this.findTagEnd(start + opening[0].length, end);

  if (openEnd < 0) {
    return undefined;
  }

  const attributes = this.parseStaticAttributes(
    start + opening[0].length,
    openEnd,
  );

  if (!attributes) {
    return undefined;
  }

  const range = { start, end };

  if (tag === 'br' && Object.keys(attributes).length === 0) {
    return { type: 'break', hard: true, range };
  }

  const formatting: Record<string, TiddlyWikiFormattingType> = {
    strong: 'strong',
    b: 'strong',
    em: 'emphasis',
    i: 'emphasis',
    u: 'underline',
    s: 'strike',
    del: 'strike',
    mark: 'highlight',
    sup: 'superscript',
    sub: 'subscript',
  };

  const closeStart = this.source.lastIndexOf('</', end);

  if (tag === '$image') {
    return parseTiddlyWikiHtmlImage.call(
      this,
      { start, end, tag, openEnd, closeStart, attributes, range },
      depth,
    );
  }

  if (tag === '$transclude') {
    return parseTiddlyWikiHtmlTransclusion.call(this, {
      start,
      end,
      tag,
      openEnd,
      closeStart,
      attributes,
      range,
    });
  }

  if (closeStart < openEnd) {
    return undefined;
  }

  if (tag === 'sup' && Object.keys(attributes).length === 0) {
    const footnoteLink = /^<a href="#footnote-([^"<>]+)">[\s\S]*<\/a>$/.exec(
      this.source.slice(openEnd, closeStart),
    );

    if (footnoteLink) {
      try {
        return {
          type: 'footnoteReference',
          identifier: decodeURIComponent(footnoteLink[1]),
          range,
        };
      } catch {
        return undefined;
      }
    }
  }

  if (formatting[tag] && Object.keys(attributes).length === 0) {
    return {
      type: formatting[tag],
      children: this.parseInline(openEnd, closeStart, depth + 1),
      range,
    };
  }

  if (tag === 'code' && Object.keys(attributes).length === 0) {
    return parseTiddlyWikiHtmlInlineCode.call(
      this,
      { start, end, tag, openEnd, closeStart, attributes, range },
      depth,
    );
  }

  if (tag === 'a' || tag === '$link') {
    return parseTiddlyWikiHtmlLink.call(
      this,
      { start, end, tag, openEnd, closeStart, attributes, range },
      depth,
    );
  }

  return undefined;
}
