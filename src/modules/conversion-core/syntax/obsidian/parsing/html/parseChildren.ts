import { HtmlCursor } from '@/modules/conversion-core/syntax/obsidian/types/HtmlCursor';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { parseElement } from '@/modules/conversion-core/syntax/obsidian/parsing/html/parseElement';
import { decodeHtml } from '@/modules/conversion-core/syntax/obsidian/parsing/html/decodeHtml';

export function parseChildren(
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
      const element = parseElement(source, cursor, parseChildren);

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
