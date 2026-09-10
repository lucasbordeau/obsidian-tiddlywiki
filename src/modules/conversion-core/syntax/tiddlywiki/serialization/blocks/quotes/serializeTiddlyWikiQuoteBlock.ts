import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../../context/types/TiddlyWikiSerializationContext';
import { quoteTiddlyWikiAttribute } from '../../escaping/quoteTiddlyWikiAttribute';
import { escapeTiddlyWikiText } from '../../escaping/escapeTiddlyWikiText';

export function serializeTiddlyWikiQuoteBlock(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'quote' }>,
): string {
  if (block.callout) {
    this.diagnose(
      block,
      'tw-html-callout',
      'The callout is represented as a static HTML aside.',
    );

    const title = block.callout.title || block.callout.type;
    const typeAttribute = quoteTiddlyWikiAttribute(block.callout.type);
    const titleAttribute = quoteTiddlyWikiAttribute(block.callout.title);

    if (!typeAttribute || !titleAttribute) {
      return this.preserve(
        block,
        'The callout title uses an unsupported attribute delimiter.',
        true,
      );
    }

    const fold = block.callout.fold
      ? ` data-callout-fold="${block.callout.fold}"`
      : '';

    const renderedTitle = block.callout.titleNodes
      ? this.serializeInline(block.callout.titleNodes)
      : escapeTiddlyWikiText(title);

    return `<aside class="callout" data-callout=${typeAttribute} data-callout-title=${titleAttribute}${fold}>\n\n<strong>${renderedTitle}</strong>\n\n${this.serializeBlocks(block.children)}\n\n</aside>`;
  }

  const originalLineQuotes =
    this.document.dialect === 'tiddlywiki' &&
    block.range &&
    /^\s*>/.test(
      this.document.source.slice(block.range.start, block.range.end),
    );

  if (originalLineQuotes && this.isLineQuote(block)) {
    return this.serializeLineQuote(block, '');
  }

  const contents = this.serializeBlocks(block.children);

  const longestMarker = Math.max(
    2,
    ...Array.from(
      contents.matchAll(/^\s*(<{3,})/gm),
      (match) => match[1].length,
    ),
  );

  const fence = '<'.repeat(longestMarker + 1);

  return fence + '\n' + contents + '\n' + fence;
}
