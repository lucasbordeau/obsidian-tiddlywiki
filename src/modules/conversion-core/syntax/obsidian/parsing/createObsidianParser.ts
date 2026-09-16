import MarkdownIt from 'markdown-it';
import { registerObsidianRules } from '@/modules/conversion-core/syntax/obsidian/rules/registerObsidianRules';

export function createObsidianParser(): MarkdownIt {
  const obsidianParser = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    typographer: false,
  });

  registerObsidianRules(obsidianParser);

  return obsidianParser;
}
