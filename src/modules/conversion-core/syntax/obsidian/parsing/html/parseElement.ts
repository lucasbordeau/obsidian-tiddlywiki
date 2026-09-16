import { HtmlCursor } from '@/modules/conversion-core/syntax/obsidian/types/HtmlCursor';
import { HtmlChildrenParser } from '@/modules/conversion-core/syntax/obsidian/types/HtmlChildrenParser';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { parseAttributes } from '@/modules/conversion-core/syntax/obsidian/parsing/html/parseAttributes';
import { areHtmlAttributesAllowed } from '@/modules/conversion-core/syntax/obsidian/parsing/html/areHtmlAttributesAllowed';
import { isSafeRemoteMediaUrl } from '@/modules/conversion-core/validation/isSafeRemoteMediaUrl';

const formatTypes = {
  strong: 'strong',
  b: 'strong',
  em: 'emphasis',
  i: 'emphasis',
  u: 'underline',
  del: 'strike',
  s: 'strike',
  mark: 'highlight',
  sup: 'superscript',
  sub: 'subscript',
} as const;

export function parseElement(
  source: string,
  cursor: HtmlCursor,
  collectChildren: HtmlChildrenParser,
): InlineNode | undefined {
  const opening = /^<([a-z][a-z\d-]*)(\s[^>]*|\s*\/?)>/i.exec(
    source.slice(cursor.position),
  );

  if (!opening) {
    return undefined;
  }

  const tag = opening[1].toLowerCase();
  const attributes = parseAttributes(opening[2]);

  if (!attributes) {
    return undefined;
  }

  cursor.position += opening[0].length;

  if (tag === 'br' && Object.keys(attributes).length === 0) {
    return { type: 'break', hard: true };
  }

  if (tag === 'img') {
    const supportedAttributes = areHtmlAttributesAllowed(attributes, [
      'src',
      'alt',
      'title',
      'width',
      'height',
    ]);

    if (!supportedAttributes || attributes.src === undefined) {
      return undefined;
    }

    const embed: InlineNode = {
      type: 'embed',
      target: attributes.src,
      alt: attributes.alt ?? '',
      kind: 'image',
    };

    if (attributes.title !== undefined) {
      embed.title = attributes.title;
    }

    if (attributes.width !== undefined) {
      embed.width = attributes.width;
    }

    if (attributes.height !== undefined) {
      embed.height = attributes.height;
    }

    return embed;
  }

  if (tag === 'audio' || tag === 'video') {
    const canonicalAttributes =
      /^\s+controls="controls"(?:\s+preload="none")?\s+src="[^"]*"\s*$/.test(
        opening[2],
      );

    const mediaSource = attributes.src ?? '';
    const safeSource = isSafeRemoteMediaUrl(mediaSource);

    const closing = new RegExp(`^</${tag}\\s*>`, 'i').exec(
      source.slice(cursor.position),
    );

    if (!canonicalAttributes || !safeSource || !closing) {
      return undefined;
    }

    cursor.position += closing[0].length;

    return {
      type: 'embed',
      target: mediaSource,
      alt: '',
      kind: tag,
    };
  }

  const children = collectChildren(source, cursor, tag);

  if (!children) {
    return undefined;
  }

  if (tag === 'a') {
    const supportedAttributes = areHtmlAttributesAllowed(attributes, [
      'href',
      'title',
    ]);

    if (!supportedAttributes || attributes.href === undefined) {
      return undefined;
    }

    const link: InlineNode = {
      type: 'link',
      target: attributes.href,
      label: children,
      external: /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(attributes.href),
    };

    if (attributes.title !== undefined) {
      link.title = attributes.title;
    }

    return link;
  }

  if (Object.keys(attributes).length !== 0) {
    return undefined;
  }

  if (tag === 'code') {
    const allText = children.every((child) => child.type === 'text');

    if (!allText) {
      return undefined;
    }

    return {
      type: 'code',
      value: children
        .map((child) => (child.type === 'text' ? child.value : ''))
        .join(''),
    };
  }

  if (!(tag in formatTypes)) {
    return undefined;
  }

  return { type: formatTypes[tag as keyof typeof formatTypes], children };
}
