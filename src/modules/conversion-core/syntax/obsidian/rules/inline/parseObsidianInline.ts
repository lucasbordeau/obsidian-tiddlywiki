import MarkdownIt from 'markdown-it';
import { parseWikiReference } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseWikiReference';
import { parseWebEmbed } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseWebEmbed';
import { parseInlineComment } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseInlineComment';
import { parseHighlight } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseHighlight';
import { parseFootnoteReference } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseFootnoteReference';
import { parseInlineFootnote } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseInlineFootnote';
import { parseInlineMath } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseInlineMath';
import { parseBlockIdentifier } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseBlockIdentifier';

export function parseObsidianInline(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);

  const startsWikiReference =
    remaining.startsWith('![[') || remaining.startsWith('[[');

  if (startsWikiReference) {
    return parseWikiReference(state, silent);
  }

  const rules = [
    parseWebEmbed,
    parseInlineComment,
    parseHighlight,
    parseFootnoteReference,
    parseInlineFootnote,
    parseInlineMath,
    parseBlockIdentifier,
  ];

  for (const rule of rules) {
    if (rule(state, silent)) {
      return true;
    }
  }

  return false;
}
