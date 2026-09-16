import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiHtmlState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/TiddlyWikiHtmlState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlCallout(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
  depth = 0,
): BlockNode | undefined {
  const { openEnd, closeStart, attributes, range } = state;

  const knownAttributes = Object.keys(attributes).every((name) =>
    [
      'class',
      'data-callout',
      'data-callout-title',
      'data-callout-fold',
    ].includes(name),
  );

  const validFold =
    attributes['data-callout-fold'] === undefined ||
    /^[+-]$/.test(attributes['data-callout-fold']);

  const invalidCallout =
    !knownAttributes ||
    attributes.class !== 'callout' ||
    !attributes['data-callout'] ||
    !validFold;

  if (invalidCallout) {
    return undefined;
  }

  let contentStart = openEnd;

  while (contentStart < closeStart) {
    const leadingWhitespace = /\s/.test(this.source[contentStart]);

    if (!leadingWhitespace) {
      break;
    }

    contentStart++;
  }

  if (!this.source.startsWith('<strong>', contentStart)) {
    return undefined;
  }

  const titleEnd = this.findHtmlEnd(contentStart, closeStart);
  const titleClose = this.source.lastIndexOf('</strong>', titleEnd);

  if (titleClose < contentStart) {
    return undefined;
  }

  const titleNodes = this.parseInline(
    contentStart + '<strong>'.length,
    titleClose,
  );

  const callout: NonNullable<Extract<BlockNode, { type: 'quote' }>['callout']> =
    {
      type: attributes['data-callout'],
      title: attributes['data-callout-title'] ?? '',
    };

  const richTitle = titleNodes.some((node) => node.type !== 'text');

  if (richTitle) {
    callout.titleNodes = titleNodes;
  }

  if (attributes['data-callout-fold']) {
    callout.fold = attributes['data-callout-fold'] as '+' | '-';
  }

  return {
    type: 'quote',
    callout,
    children: this.parseFragment(titleEnd, closeStart),
    range,
  };
}
