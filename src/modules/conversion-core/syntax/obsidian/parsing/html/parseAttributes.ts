import type { HtmlAttributes } from '../../types/HtmlAttributes';
import { decodeHtml } from './decodeHtml';

export function parseAttributes(source: string): HtmlAttributes | undefined {
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
