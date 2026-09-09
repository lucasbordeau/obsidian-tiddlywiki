import MarkdownIt from 'markdown-it';
import { registerObsidianRules } from './registerObsidianRules';

export function createObsidianParser(): MarkdownIt {
  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    typographer: false,
  });
  registerObsidianRules(markdown);
  return markdown;
}
