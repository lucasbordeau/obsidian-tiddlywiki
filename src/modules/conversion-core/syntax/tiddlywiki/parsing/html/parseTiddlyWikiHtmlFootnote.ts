import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiHtmlState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/TiddlyWikiHtmlState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlFootnote(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
  depth = 0,
): BlockNode | undefined {
  const { openEnd, closeStart, attributes, range } = state;

  const knownAttributes =
    Object.keys(attributes).length === 1 &&
    attributes.id?.startsWith('footnote-');

  if (!knownAttributes) {
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

  if (!this.source.startsWith('<sup>', contentStart)) {
    return undefined;
  }

  contentStart = this.findHtmlEnd(contentStart, closeStart);

  try {
    return {
      type: 'footnoteDefinition',
      identifier: decodeURIComponent(attributes.id.slice('footnote-'.length)),
      children: this.parseFragment(contentStart, closeStart),
      range,
    };
  } catch {
    return undefined;
  }
}
