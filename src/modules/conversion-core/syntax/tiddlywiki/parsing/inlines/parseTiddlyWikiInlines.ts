import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiInlines(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth = 0,
): InlineNode[] {
  if (depth > 100) {
    return [
      this.rawInline(start, end, 'The inline nesting limit was reached.'),
    ];
  }

  const children: InlineNode[] = [];
  let cursor = start;
  let textStart = start;

  const flushText = () => {
    if (textStart < cursor) {
      children.push({
        type: 'text',
        value: this.source.slice(textStart, cursor),
        range: { start: textStart, end: cursor },
      });
    }
  };

  while (cursor < end) {
    if (this.source.startsWith('"""', cursor)) {
      flushText();

      const opening = cursor;
      let contentStart = cursor + 3;

      if (this.source.startsWith('\r\n', contentStart)) {
        contentStart += 2;
      } else if (this.source[contentStart] === '\n') {
        contentStart++;
      }

      const closing = this.source.indexOf('"""', contentStart);
      const closed = closing >= 0 && closing + 3 <= end;
      const contentEnd = closed ? closing : end;

      const hardLineChildren = this.parseInline(
        contentStart,
        contentEnd,
        depth + 1,
      );

      for (const child of hardLineChildren) {
        if (child.type === 'break') {
          child.hard = true;
        }
      }

      children.push(...hardLineChildren);

      cursor = closed ? closing + 3 : end;
      textStart = cursor;

      if (!closed) {
        this.warn(
          'tw-unclosed-hardlinebreaks',
          'The hard-linebreak region continues to the end of the source.',
          { start: opening, end: cursor },
        );
      }

      continue;
    }

    const match = this.matchInline(cursor, end, depth);

    if (match) {
      flushText();
      children.push(match.node);

      cursor = match.end;
      textStart = cursor;
    } else {
      cursor++;
    }
  }

  flushText();

  return children;
}
