import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';
import { parseTiddlyWikiHtmlCallout } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlCallout';
import { parseTiddlyWikiHtmlFootnote } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlFootnote';
import { parseTiddlyWikiHtmlCodeBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlCodeBlock';
import { parseTiddlyWikiHtmlExampleBox } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlExampleBox';
import { parseTiddlyWikiHtmlList } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiHtmlList';

export function parseTiddlyWikiStaticHtmlBlock(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): BlockNode | undefined {
  const opening = /^<(ul|ol|pre|aside|div)\b/i.exec(
    this.source.slice(start, end),
  );

  if (!opening) {
    return undefined;
  }

  const tag = opening[1].toLowerCase();
  const openEnd = this.findTagEnd(start + opening[0].length, end);
  const closeStart = this.source.lastIndexOf('</' + tag, end);

  if (openEnd < 0 || closeStart < openEnd) {
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

  if (tag === 'aside') {
    return parseTiddlyWikiHtmlCallout.call(this, {
      start,
      end,
      tag,
      openEnd,
      closeStart,
      attributes,
      range,
    });
  }

  if (tag === 'div') {
    const state = {
      start,
      end,
      tag,
      openEnd,
      closeStart,
      attributes,
      range,
    };

    return (
      parseTiddlyWikiHtmlExampleBox.call(this, state) ??
      parseTiddlyWikiHtmlFootnote.call(this, state)
    );
  }

  if (tag === 'pre') {
    return parseTiddlyWikiHtmlCodeBlock.call(this, {
      start,
      end,
      tag,
      openEnd,
      closeStart,
      attributes,
      range,
    });
  }

  return parseTiddlyWikiHtmlList.call(this, {
    start,
    end,
    tag,
    openEnd,
    closeStart,
    attributes,
    range,
  });
}
