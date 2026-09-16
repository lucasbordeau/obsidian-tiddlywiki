import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { renderHtmlInlines } from '@/modules/conversion-core/syntax/obsidian/serialization/renderHtmlInlines';
import { resolveLinkTarget } from '@/modules/conversion-core/syntax/obsidian/serialization/links/resolveLinkTarget';
import { escapeWikiPart } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeWikiPart';
import { escapeText } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeText';
import { escapeHtml } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeHtml';
import { serializeMarkdownDestination } from '@/modules/conversion-core/syntax/obsidian/serialization/links/serializeMarkdownDestination';
import { serializeMarkdownTitle } from '@/modules/conversion-core/syntax/obsidian/serialization/links/serializeMarkdownTitle';
import { isSafeRemoteMediaUrl } from '@/modules/conversion-core/validation/isSafeRemoteMediaUrl';

export function renderEmbed(
  node: Extract<InlineNode, { type: 'embed' }>,
  context: SerializationContext,
): string {
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
  const targetIsExternal = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target);
  const externalTransclusion = node.kind === 'transclusion' && targetIsExternal;

  const externalMediaKind = externalTransclusion
    ? context.options.resolveExternalEmbedKind?.(node.target)
    : undefined;

  const mediaKind =
    node.kind === 'audio' || node.kind === 'video'
      ? node.kind
      : externalMediaKind;

  const safeRemoteMediaTarget = isSafeRemoteMediaUrl(target);

  if (
    safeRemoteMediaTarget &&
    (mediaKind === 'audio' || mediaKind === 'video')
  ) {
    return `<${mediaKind} controls="controls" preload="none" src="${escapeHtml(target)}"></${mediaKind}>`;
  }

  if (safeRemoteMediaTarget && externalMediaKind === 'image') {
    const alt = node.alt || node.target;

    return `![${escapeText(alt)}](${serializeMarkdownDestination(target)})`;
  }

  if (externalTransclusion) {
    const label = node.alt || node.target;

    return `[${escapeText(label)}](${serializeMarkdownDestination(target)})`;
  }

  const useWikiEmbed =
    node.kind === 'transclusion' ||
    (!external && node.title === undefined && node.width !== undefined);

  if (useWikiEmbed) {
    let alias = node.alt;

    if (node.width) {
      alias = `${node.width}${node.height ? `x${node.height}` : ''}`;
    }

    return `![[${escapeWikiPart(target)}${alias ? `|${escapeWikiPart(alias)}` : ''}]]`;
  }

  return `![${escapeText(node.alt)}](${serializeMarkdownDestination(target)}${serializeMarkdownTitle(node.title)})`;
}
