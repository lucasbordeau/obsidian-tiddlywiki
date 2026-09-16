import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { escapeHtml } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeHtml';
import { resolveLinkTarget } from '@/modules/conversion-core/syntax/obsidian/serialization/links/resolveLinkTarget';
import { isSafeRemoteMediaUrl } from '@/modules/conversion-core/validation/isSafeRemoteMediaUrl';

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
        const target = resolveLinkTarget(
          node.target,
          'link',
          context,
          node.external,
        );

        const title =
          node.title === undefined ? '' : ` title="${escapeHtml(node.title)}"`;

        return `<a href="${escapeHtml(target)}"${title}>${renderHtmlInlines(node.label, context)}</a>`;
      }

      if (node.type === 'embed' && node.kind === 'image') {
        const target = resolveLinkTarget(
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

      const isRemoteMedia =
        node.type === 'embed' &&
        (node.kind === 'audio' || node.kind === 'video');

      if (isRemoteMedia) {
        const target = resolveLinkTarget(
          node.target,
          'embed',
          context,
          isSafeRemoteMediaUrl(node.target),
        );

        if (isSafeRemoteMediaUrl(target)) {
          return `<${node.kind} controls="controls" preload="none" src="${escapeHtml(target)}"></${node.kind}>`;
        }
      }

      // HTML wrappers disable Markdown parsing in Obsidian. Keep foreign constructs explicit.
      return escapeHtml(context.renderInline(node));
    })
    .join('');
}
