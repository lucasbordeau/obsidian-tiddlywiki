import type { InlineNode } from '../../../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiHtmlState } from '../../types/TiddlyWikiHtmlState';
import type { TiddlyWikiParsingContext } from '../../../context/types/TiddlyWikiParsingContext';

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
