import MarkdownIt from 'markdown-it';
import { parseFrontMatterBlock } from '@/modules/conversion-core/syntax/obsidian/rules/block/parseFrontMatterBlock';
import { parseMathBlock } from '@/modules/conversion-core/syntax/obsidian/rules/block/parseMathBlock';
import { parseFootnoteDefinitionBlock } from '@/modules/conversion-core/syntax/obsidian/rules/block/parseFootnoteDefinitionBlock';
import { parseCommentBlock } from '@/modules/conversion-core/syntax/obsidian/rules/block/parseCommentBlock';

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
