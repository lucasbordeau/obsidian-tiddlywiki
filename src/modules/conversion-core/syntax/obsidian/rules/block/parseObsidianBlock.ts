import MarkdownIt from 'markdown-it';
import { parseFrontMatterBlock } from './parseFrontMatterBlock';
import { parseMathBlock } from './parseMathBlock';
import { parseFootnoteDefinitionBlock } from './parseFootnoteDefinitionBlock';
import { parseCommentBlock } from './parseCommentBlock';

export function parseObsidianBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }

  const rules = [
    parseFrontMatterBlock,
    parseMathBlock,
    parseFootnoteDefinitionBlock,
    parseCommentBlock,
  ];

  for (const rule of rules) {
    if (rule(state, startLine, endLine, silent)) {
      return true;
    }
  }

  return false;
}
