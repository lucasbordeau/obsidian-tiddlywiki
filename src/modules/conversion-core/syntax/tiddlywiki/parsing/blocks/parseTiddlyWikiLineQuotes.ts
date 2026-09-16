import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiLineQuotes(
  this: TiddlyWikiParsingContext,
  firstLine: number,
  endLine: number,
): BlockNode[] {
  const quoteBlocks: BlockNode[] = [];
  const quoteStack: Extract<BlockNode, { type: 'quote' }>[] = [];

  for (let index = firstLine; index < endLine; index++) {
    const line = this.lines[index];
    const match = /^\s*(>+)[ \t]?(.*)$/.exec(line.text);

    if (!match) {
      continue;
    }

    const depth = match[1].length;

    quoteStack.length = Math.min(depth, quoteStack.length);

    while (quoteStack.length < depth) {
      const quote: Extract<BlockNode, { type: 'quote' }> = {
        type: 'quote',
        children: [],
        range: { start: line.start, end: line.end },
      };

      const parent = quoteStack[quoteStack.length - 1];

      if (parent) {
        parent.children.push(quote);
      } else {
        quoteBlocks.push(quote);
      }

      quoteStack.push(quote);
    }

    for (const quote of quoteStack) {
      if (quote.range) {
        quote.range.end = line.end;
      }
    }

    const contentStart = line.end - match[2].length;

    quoteStack[depth - 1].children.push({
      type: 'paragraph',
      children: this.parseInline(contentStart, line.end),
      range: { start: contentStart, end: line.end },
    });
  }

  return quoteBlocks;
}
