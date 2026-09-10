import type { BlockNode } from '../../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiHtmlState } from '../../types/TiddlyWikiHtmlState';
import type { TiddlyWikiParsingContext } from '../../../context/types/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlCodeBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
  depth = 0,
): BlockNode | undefined {
  const { openEnd, closeStart, attributes, range } = state;

  const code = /^<code(?: class=("[^"]*"|'[^']*'))?>/.exec(
    this.source.slice(openEnd, closeStart),
  );

  const codeClose = this.source.lastIndexOf('</code>', closeStart);

  if (!code || codeClose < openEnd || Object.keys(attributes).length) {
    return undefined;
  }

  const contentStart = openEnd + code[0].length;
  const content = this.parseInline(contentStart, codeClose);

  const literal = content.every(
    (child) => child.type === 'text' || child.type === 'break',
  );

  if (!literal) {
    return undefined;
  }

  const language = code[1]?.slice(1, -1).replace(/^language-/, '') ?? '';

  return {
    type: 'code',
    value: content
      .map((child) => (child.type === 'text' ? child.value : '\n'))
      .join(''),
    language,
    range,
  };
}
