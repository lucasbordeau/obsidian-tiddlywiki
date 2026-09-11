import MarkdownIt from 'markdown-it';
import { parseWikiReference } from './parseWikiReference';
import { parseWebEmbed } from './parseWebEmbed';
import { parseInlineComment } from './parseInlineComment';
import { parseHighlight } from './parseHighlight';
import { parseFootnoteReference } from './parseFootnoteReference';
import { parseInlineFootnote } from './parseInlineFootnote';
import { parseInlineMath } from './parseInlineMath';
import { parseBlockIdentifier } from './parseBlockIdentifier';

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
