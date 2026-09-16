import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiHtmlState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/TiddlyWikiHtmlState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlInlineCode(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
  depth = 0,
): InlineNode | undefined {
  const { openEnd, closeStart, range } = state;

  const contents = this.parseInline(openEnd, closeStart, depth + 1);

  const literal = contents.every(
    (child) => child.type === 'text' || child.type === 'break',
  );

  if (literal) {
    return {
      type: 'code',
      value: contents
        .map((child) => (child.type === 'text' ? child.value : '\n'))
        .join(''),
      range,
    };
  }

  return undefined;
}
