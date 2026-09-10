import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { SerializationContext } from '../../types/serialization/SerializationContext';
import { targetLink } from './targetLink';
import { plainLabel } from './plainLabel';
import { escapeWikiPart } from '../escaping/escapeWikiPart';
import { markdownDestination } from './markdownDestination';
import { markdownTitle } from './markdownTitle';

export function renderLink(
  node: Extract<InlineNode, { type: 'link' }>,
  context: SerializationContext,
): string {
  const target = targetLink(node.target, 'link', context, node.external);
  const label = plainLabel(node.label);

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

  return `[${context.renderInlines(node.label)}](${markdownDestination(target)}${markdownTitle(node.title)})`;
}
