import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { SerializationContext } from '../../types/SerializationContext';
import { emitRaw } from '../emitRaw';
import { renderHtmlInlines } from '../renderHtmlInlines';
import { resolveLinkTarget } from './resolveLinkTarget';
import { escapeWikiPart } from '../escaping/escapeWikiPart';
import { escapeText } from '../escaping/escapeText';
import { serializeMarkdownDestination } from './serializeMarkdownDestination';
import { serializeMarkdownTitle } from './serializeMarkdownTitle';

export function renderEmbed(
  node: Extract<InlineNode, { type: 'embed' }>,
  context: SerializationContext,
): string {
  const ambiguousImageTransclusion =
    node.kind === 'note' &&
    /\.(?:avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)(?:#.*)?$/i.test(node.target);

  if (ambiguousImageTransclusion) {
    const source =
      node.range && context.document.dialect === 'tiddlywiki'
        ? context.document.source.slice(node.range.start, node.range.end)
        : `{{${node.target}}}`;

    return emitRaw(
      {
        type: 'raw',
        dialect: 'tiddlywiki',
        value: source,
        reason: 'TiddlyWiki transclusion of an image-like title',
        range: node.range,
      },
      context,
    );
  }

  const external = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.target);
  const hasSize = node.width !== undefined || node.height !== undefined;
  const literalNumericAlt = !hasSize && /^\d+(?:x\d+)?$/.test(node.alt);

  const needsHtmlSize =
    node.kind === 'image' &&
    (literalNumericAlt ||
      (hasSize &&
        (Boolean(node.alt) ||
          node.title !== undefined ||
          external ||
          node.width === undefined)));

  if (needsHtmlSize) {
    return renderHtmlInlines([node], context);
  }

  const target = resolveLinkTarget(node.target, 'embed', context, external);

  const useWikiEmbed =
    node.kind === 'note' ||
    (!external &&
      node.title === undefined &&
      (!node.alt || node.width !== undefined));

  if (useWikiEmbed) {
    let alias = node.alt;

    if (node.width) {
      alias = `${node.width}${node.height ? `x${node.height}` : ''}`;
    }

    return `![[${escapeWikiPart(target)}${alias ? `|${escapeWikiPart(alias)}` : ''}]]`;
  }

  return `![${escapeText(node.alt)}](${serializeMarkdownDestination(target)}${serializeMarkdownTitle(node.title)})`;
}
