import MarkdownIt from 'markdown-it';
import { frontMatterBlock } from './frontMatterBlock';
import { mathBlock } from './mathBlock';
import { footnoteDefinitionBlock } from './footnoteDefinitionBlock';
import { commentBlock } from './commentBlock';

export function obsidianBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }

  const rules = [
    frontMatterBlock,
    mathBlock,
    footnoteDefinitionBlock,
    commentBlock,
  ];

  for (const rule of rules) {
    if (rule(state, startLine, endLine, silent)) {
      return true;
    }
  }

  return false;
}
