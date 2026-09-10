import type { InlineNode } from '../../../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiHtmlState } from '../../types/TiddlyWikiHtmlState';
import type { TiddlyWikiParsingContext } from '../../../context/types/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlLink(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
  depth = 0,
): InlineNode | undefined {
  const { tag, openEnd, closeStart, attributes, range } = state;

  const knownAttributes = Object.keys(attributes).every((name) =>
    (tag === 'a' ? ['href', 'title'] : ['to', 'tooltip']).includes(name),
  );

  const target = tag === 'a' ? attributes.href : attributes.to;

  if (!knownAttributes || target === undefined) {
    return undefined;
  }

  const node: Extract<InlineNode, { type: 'link' }> = {
    type: 'link',
    target,
    label: this.parseInline(openEnd, closeStart, depth + 1),
    external: tag === 'a',
    range,
  };

  if (attributes.title !== undefined) {
    node.title = attributes.title;
  }

  if (tag === '$link' && attributes.tooltip !== undefined) {
    node.title = attributes.tooltip;
  }

  return node;
}
