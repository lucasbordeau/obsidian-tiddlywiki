import MarkdownIt from 'markdown-it';
import { InlineNode } from '../types/InlineNode';

type HtmlCursor = { position: number };
type HtmlAttributes = Record<string, string>;

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

const markdownUtilities = new MarkdownIt().utils;

function decodeHtml(value: string): string {
  return markdownUtilities.unescapeAll(value.replace(/\\/g, '\\\\'));
}

function parseAttributes(source: string): HtmlAttributes | undefined {
  const attributes: HtmlAttributes = {};
  const attributePattern =
    /\s+([a-z][a-z\d-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
  let position = 0;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(source)) !== null) {
    if (source.slice(position, match.index).trim() !== '') {
      return undefined;
    }
    attributes[match[1].toLowerCase()] = decodeHtml(
      match[2] ?? match[3] ?? match[4],
    );
    position = attributePattern.lastIndex;
  }
  if (source.slice(position).replace(/\/$/, '').trim() !== '') {
    return undefined;
  }
  return attributes;
}

function attributesAllowed(
  attributes: HtmlAttributes,
  names: string[],
): boolean {
  return Object.keys(attributes).every((name) => names.includes(name));
}

function parseElement(
  source: string,
  cursor: HtmlCursor,
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
  const children = parseChildren(source, cursor, tag);
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

function parseChildren(
  source: string,
  cursor: HtmlCursor,
  closingTag?: string,
): InlineNode[] | undefined {
  const children: InlineNode[] = [];
  while (cursor.position < source.length) {
    if (closingTag) {
      const closing = new RegExp(`^</${closingTag}\\s*>`, 'i').exec(
        source.slice(cursor.position),
      );
      if (closing) {
        cursor.position += closing[0].length;
        return children;
      }
    }
    if (source[cursor.position] === '<') {
      const element = parseElement(source, cursor);
      if (!element) {
        return undefined;
      }
      children.push(element);
      continue;
    }
    const nextTag = source.indexOf('<', cursor.position);
    const end = nextTag === -1 ? source.length : nextTag;
    children.push({
      type: 'text',
      value: decodeHtml(source.slice(cursor.position, end)),
    });
    cursor.position = end;
  }
  return closingTag ? undefined : children;
}

/** Parse a deliberately small, inert HTML subset without executing attributes or widgets. */
export function parseStaticHtmlInline(
  source: string,
): InlineNode[] | undefined {
  return parseChildren(source, { position: 0 });
}
