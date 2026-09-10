import MarkdownIt from 'markdown-it';
import { obsidianInline } from './inline/obsidianInline';
import { htmlRegion } from './inline/htmlRegion';
import { obsidianBlock } from './block/obsidianBlock';

export function registerObsidianRules(markdown: MarkdownIt): void {
  markdown.inline.ruler.before('image', 'otw_obsidian', obsidianInline);
  markdown.inline.ruler.before('html_inline', 'otw_html_region', htmlRegion);

  markdown.block.ruler.before('fence', 'otw_obsidian_block', obsidianBlock, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
}
