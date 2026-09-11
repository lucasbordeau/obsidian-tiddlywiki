import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function parseTiddlyWikiStaticAttributes(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): Record<string, string> | undefined {
  const attributes: Record<string, string> = {};
  const value = this.source.slice(start, end).replace(/\/?\s*>$/, '');

  const pattern =
    /\s*([\w:-]+)(?:\s*=\s*(?:"""([\s\S]*?)"""|"([^"]*)"|'([^']*)'|([^\s<>"'=]+)))?/gy;

  let cursor = 0;

  while (cursor < value.length) {
    if (!value.slice(cursor).trim()) {
      break;
    }

    pattern.lastIndex = cursor;

    const match = pattern.exec(value);

    if (!match) {
      return undefined;
    }

    const attribute = match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
    const dynamicAttribute = match[5] && /^(?:\{\{|<<|\(\(|`)/.test(attribute);

    if (dynamicAttribute) {
      return undefined;
    }

    attributes[match[1]] = attribute;

    cursor = pattern.lastIndex;
  }

  return attributes;
}
