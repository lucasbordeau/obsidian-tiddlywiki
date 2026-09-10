import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';
import { parseTiddlyWikiHtmlCallout } from './callouts/parseTiddlyWikiHtmlCallout';
import { parseTiddlyWikiHtmlFootnote } from './footnotes/parseTiddlyWikiHtmlFootnote';
import { parseTiddlyWikiHtmlCodeBlock } from './code/parseTiddlyWikiHtmlCodeBlock';
import { parseTiddlyWikiHtmlList } from './lists/parseTiddlyWikiHtmlList';

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
    return parseTiddlyWikiHtmlFootnote.call(this, {
      start,
      end,
      tag,
      openEnd,
      closeStart,
      attributes,
      range,
    });
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
