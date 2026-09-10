import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiBlockState } from '../types/TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from '../types/TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiListBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { endLine, start, text } = state;

  if (/^[*#;:>]/.test(text)) {
    let listEnd = lineIndex + 1;

    while (listEnd < endLine) {
      const nextLineIsList = /^\s*[*#;:>]/.test(this.lines[listEnd].text);

      if (!nextLineIsList) {
        break;
      }

      listEnd++;
    }

    const listLines = this.lines.slice(lineIndex, listEnd);

    const hasSpecialList = listLines.some((listLine) =>
      /^\s*[*#;:>]*[;:]|^\s*[*#;:>]+\.[\w-]|^\s*[*#]+>/.test(listLine.text),
    );

    if (hasSpecialList) {
      blocks.push(
        this.rawBlock(
          start,
          this.lines[listEnd - 1].end,
          'Definition lists, styled list entries and mixed list/quote prefixes retain their original syntax.',
        ),
      );
    } else if (text[0] === '>') {
      let quoteEnd = lineIndex + 1;

      while (quoteEnd < listEnd) {
        const nextLineIsQuote = /^\s*>/.test(this.lines[quoteEnd].text);

        if (!nextLineIsQuote) {
          break;
        }

        quoteEnd++;
      }

      blocks.push(...this.parseLineQuotes(lineIndex, quoteEnd));

      lineIndex = quoteEnd;

      return { blocks, nextLine: lineIndex };
    } else {
      blocks.push(...this.parseLists(lineIndex, listEnd));
    }

    lineIndex = listEnd;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
