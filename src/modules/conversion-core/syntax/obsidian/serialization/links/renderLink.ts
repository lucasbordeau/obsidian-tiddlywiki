import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { resolveLinkTarget } from '@/modules/conversion-core/syntax/obsidian/serialization/links/resolveLinkTarget';
import { getPlainLinkLabel } from '@/modules/conversion-core/syntax/obsidian/serialization/links/getPlainLinkLabel';
import { escapeWikiPart } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeWikiPart';
import { serializeMarkdownDestination } from '@/modules/conversion-core/syntax/obsidian/serialization/links/serializeMarkdownDestination';
import { serializeMarkdownTitle } from '@/modules/conversion-core/syntax/obsidian/serialization/links/serializeMarkdownTitle';

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
