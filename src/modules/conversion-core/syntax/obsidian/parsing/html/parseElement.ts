import type { HtmlCursor } from '../../types/html/HtmlCursor';
import type { HtmlChildrenParser } from '../../types/html/HtmlChildrenParser';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { parseAttributes } from './parseAttributes';
import { attributesAllowed } from './attributesAllowed';

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
    const supportedAttributes = attributesAllowed(attributes, [
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

  const children = collectChildren(source, cursor, tag);

  if (!children) {
    return undefined;
  }

  if (tag === 'a') {
    const supportedAttributes = attributesAllowed(attributes, [
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
