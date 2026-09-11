import MarkdownIt from 'markdown-it';
import { getLineText } from './getLineText';
import { pushBlockToken } from './pushBlockToken';

export function parseFootnoteDefinitionBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  const firstLine = getLineText(state, startLine);
  const footnoteDefinition = /^\[\^([^\]]+)\]:[ \t]*(.*)$/.exec(firstLine);

  if (footnoteDefinition) {
    let closingLine = startLine + 1;
    let lastContentLine = startLine;
    let continuationIndent = 4;

    while (closingLine < endLine) {
      const emptyLine = state.isEmpty(closingLine);
      const relativeIndent = state.sCount[closingLine] - state.blkIndent;
      const indentedContinuation = relativeIndent >= 2;

      if (!emptyLine && !indentedContinuation) {
        break;
      }

      if (!emptyLine) {
        lastContentLine = closingLine;

        if (relativeIndent < 4) {
          continuationIndent = 2;
        }
      }

      closingLine++;
    }

    const end = lastContentLine + 1;

    const continuation = state.getLines(
      startLine + 1,
      end,
      state.blkIndent + continuationIndent,
      true,
    );

    const content = `${footnoteDefinition[2]}\n${continuation}`;

    const matched = pushBlockToken(
      state,
      'otw_footnote_definition',
      startLine,
      end,
      content,
      silent,
    );

    if (!silent) {
      state.tokens[state.tokens.length - 1].meta = {
        identifier: footnoteDefinition[1],
      };
    }

    return matched;
  }

  return false;
}
