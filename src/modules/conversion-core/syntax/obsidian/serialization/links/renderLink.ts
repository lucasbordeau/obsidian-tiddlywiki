import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { SerializationContext } from '../../types/SerializationContext';
import { resolveLinkTarget } from './resolveLinkTarget';
import { getPlainLinkLabel } from './getPlainLinkLabel';
import { escapeWikiPart } from '../escaping/escapeWikiPart';
import { serializeMarkdownDestination } from './serializeMarkdownDestination';
import { serializeMarkdownTitle } from './serializeMarkdownTitle';

export function renderLink(
  node: Extract<InlineNode, { type: 'link' }>,
  context: SerializationContext,
): string {
  const target = resolveLinkTarget(node.target, 'link', context, node.external);
  const label = getPlainLinkLabel(node.label);

  const useWikiLink =
    !node.external &&
    label !== undefined &&
    node.title === undefined &&
    !target.includes('\n');

  if (useWikiLink) {
    const encodedTarget = escapeWikiPart(target);

    if (label === node.target || label === target) {
      return `[[${encodedTarget}]]`;
    }

    return `[[${encodedTarget}|${escapeWikiPart(label)}]]`;
  }

  return `[${context.renderInlines(node.label)}](${serializeMarkdownDestination(target)}${serializeMarkdownTitle(node.title)})`;
}
