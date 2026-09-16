import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiBlockState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockState';
import { TiddlyWikiBlockMatch } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiCodeBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { line, endLine, start, text } = state;

  const fence = /^```([\w-]*)$/.exec(text);

  if (fence) {
    let closingLine = lineIndex + 2;

    while (closingLine < endLine) {
      const foundCodeFence = this.lines[closingLine].text === '```';

      if (foundCodeFence) {
        break;
      }

      closingLine++;
    }

    const closed = closingLine < endLine;
    const bodyStart = line.next;

    let bodyEnd = closed
      ? this.lines[closingLine].start
      : this.lines[endLine - 1].next;

    if (closed && bodyEnd > bodyStart) {
      bodyEnd -= this.source[bodyEnd - 2] === '\r' ? 2 : 1;
    }

    const end = closed
      ? this.lines[closingLine].end
      : this.lines[endLine - 1].end;

    blocks.push({
      type: 'code',
      value: this.source.slice(bodyStart, bodyEnd),
      language: fence[1],
      range: { start, end },
    });

    if (!closed) {
      this.warn(
        'tw-unclosed-code',
        'The code block continues to the end of the source.',
        { start, end },
      );
    }

    lineIndex = closed ? closingLine + 1 : endLine;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
