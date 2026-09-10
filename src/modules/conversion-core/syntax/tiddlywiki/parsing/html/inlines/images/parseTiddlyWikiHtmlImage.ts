import type { InlineNode } from '../../../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiHtmlState } from '../../types/TiddlyWikiHtmlState';
import type { TiddlyWikiParsingContext } from '../../../context/types/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlImage(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
  depth = 0,
): InlineNode | undefined {
  const { attributes, range } = state;

  const knownAttributes = Object.keys(attributes).every((name) =>
    ['source', 'tooltip', 'alt', 'width', 'height'].includes(name),
  );

  if (!knownAttributes || !attributes.source) {
    return undefined;
  }

  const node: Extract<InlineNode, { type: 'embed' }> = {
    type: 'embed',
    target: attributes.source,
    alt: attributes.alt ?? '',
    kind: 'image',
    range,
  };

  if (attributes.width) {
    node.width = attributes.width;
  }

  if (attributes.height) {
    node.height = attributes.height;
  }

  if (attributes.tooltip !== undefined) {
    node.title = attributes.tooltip;
  }

  return node;
}
