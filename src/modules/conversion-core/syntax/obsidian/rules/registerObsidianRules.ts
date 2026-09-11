import MarkdownIt from 'markdown-it';
import { parseObsidianInline } from './inline/parseObsidianInline';
import { parseHtmlRegion } from './inline/parseHtmlRegion';
import { parseObsidianBlock } from './block/parseObsidianBlock';

export function registerObsidianRules(markdown: MarkdownIt): void {
  markdown.inline.ruler.before('image', 'otw_obsidian', parseObsidianInline);

  markdown.inline.ruler.before(
    'html_inline',
    'otw_html_region',
    parseHtmlRegion,
  );

  markdown.block.ruler.before(
    'fence',
    'otw_obsidian_block',
    parseObsidianBlock,
    {
      alt: ['paragraph', 'reference', 'blockquote', 'list'],
    },
  );
}
