import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { SerializationContext } from '../../types/serialization/SerializationContext';
import { escapeHtml } from '../escaping/escapeHtml';
import { targetLink } from '../links/targetLink';

export function renderHtmlInlines(
  nodes: InlineNode[],
  context: SerializationContext,
): string {
  const formattingTags: Record<string, string> = {
    strong: 'strong',
    emphasis: 'em',
    underline: 'u',
    strike: 'del',
    highlight: 'mark',
    superscript: 'sup',
    subscript: 'sub',
  };

  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return escapeHtml(node.value);
      }

      if (node.type === 'code') {
        return `<code>${escapeHtml(node.value)}</code>`;
      }

      if (node.type === 'break') {
        return '<br>';
      }

      if ('children' in node) {
        const tag = formattingTags[node.type];

        return `<${tag}>${renderHtmlInlines(node.children, context)}</${tag}>`;
      }

      if (node.type === 'link') {
        const target = targetLink(node.target, 'link', context, node.external);

        const title =
          node.title === undefined ? '' : ` title="${escapeHtml(node.title)}"`;

        return `<a href="${escapeHtml(target)}"${title}>${renderHtmlInlines(node.label, context)}</a>`;
      }

      if (node.type === 'embed' && node.kind === 'image') {
        const target = targetLink(
          node.target,
          'embed',
          context,
          /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.target),
        );

        const title =
          node.title === undefined ? '' : ` title="${escapeHtml(node.title)}"`;

        const width =
          node.width === undefined ? '' : ` width="${escapeHtml(node.width)}"`;

        const height =
          node.height === undefined
            ? ''
            : ` height="${escapeHtml(node.height)}"`;

        return `<img src="${escapeHtml(target)}" alt="${escapeHtml(node.alt)}"${title}${width}${height}>`;
      }

      // HTML wrappers disable Markdown parsing in Obsidian. Keep foreign constructs explicit.
      return escapeHtml(context.renderInline(node));
    })
    .join('');
}
