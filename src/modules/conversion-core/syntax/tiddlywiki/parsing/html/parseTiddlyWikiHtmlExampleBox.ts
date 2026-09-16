import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiHtmlState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/TiddlyWikiHtmlState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlExampleBox(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
): BlockNode | undefined {
  const { openEnd, closeStart, attributes, range } = state;

  const isExampleBox =
    Object.keys(attributes).length === 1 &&
    attributes.class === 'tc-example-box';

  if (!isExampleBox) {
    return undefined;
  }

  return {
    type: 'quote',
    callout: { type: 'example', title: '' },
    children: this.parseFragment(openEnd, closeStart),
    range,
  };
}
