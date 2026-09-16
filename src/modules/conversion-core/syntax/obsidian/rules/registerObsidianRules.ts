import MarkdownIt from 'markdown-it';
import { parseObsidianInline } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseObsidianInline';
import { parseHtmlRegion } from '@/modules/conversion-core/syntax/obsidian/rules/inline/parseHtmlRegion';
import { parseObsidianBlock } from '@/modules/conversion-core/syntax/obsidian/rules/block/parseObsidianBlock';

export function registerObsidianRules(obsidianParser: MarkdownIt): void {
  obsidianParser.inline.ruler.before(
    'image',
    'otw_obsidian',
    parseObsidianInline,
  );

  obsidianParser.inline.ruler.before(
    'html_inline',
    'otw_html_region',
    parseHtmlRegion,
  );

  obsidianParser.block.ruler.before(
    'fence',
    'otw_obsidian_block',
    parseObsidianBlock,
    {
      alt: ['paragraph', 'reference', 'blockquote', 'list'],
    },
  );
}
