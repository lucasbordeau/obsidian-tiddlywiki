import MarkdownIt from 'markdown-it';
import { wikiReference } from './wikiReference';
import { webEmbed } from './webEmbed';
import { inlineComment } from './inlineComment';
import { highlight } from './highlight';
import { footnoteReference } from './footnoteReference';
import { inlineFootnote } from './inlineFootnote';
import { inlineMath } from './inlineMath';
import { blockIdentifier } from './blockIdentifier';

export function obsidianInline(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);

  const startsWikiReference =
    remaining.startsWith('![[') || remaining.startsWith('[[');

  if (startsWikiReference) {
    return wikiReference(state, silent);
  }

  const rules = [
    webEmbed,
    inlineComment,
    highlight,
    footnoteReference,
    inlineFootnote,
    inlineMath,
    blockIdentifier,
  ];

  for (const rule of rules) {
    if (rule(state, silent)) {
      return true;
    }
  }

  return false;
}
