import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';
import { serializeTiddlyWikiCodeBlock } from './serializeTiddlyWikiCodeBlock';
import { serializeTiddlyWikiQuoteBlock } from './serializeTiddlyWikiQuoteBlock';
import { serializeTiddlyWikiListBlock } from './serializeTiddlyWikiListBlock';
import { serializeTiddlyWikiTable } from './serializeTiddlyWikiTable';
import { serializeTiddlyWikiFootnote } from './serializeTiddlyWikiFootnote';

export function serializeTiddlyWikiBlock(
  this: TiddlyWikiSerializationContext,
  block: BlockNode,
): string {
  switch (block.type) {
    case 'paragraph':
      return this.serializeInline(block.children);
    case 'heading':
      return (
        '!'.repeat(Math.max(1, Math.min(6, block.level))) +
        ' ' +
        this.serializeInline(block.children)
      );
    case 'thematicBreak':
      return '---';
    case 'code':
      return serializeTiddlyWikiCodeBlock.call(this, block);
    case 'quote':
      return serializeTiddlyWikiQuoteBlock.call(this, block);
    case 'list':
      return serializeTiddlyWikiListBlock.call(this, block);
    case 'table':
      return serializeTiddlyWikiTable.call(this, block);
    case 'math':
      return this.preserve(
        block,
        'Math requires a compatible TiddlyWiki rendering plugin; the original source is retained.',
        true,
      );
    case 'footnoteDefinition':
      return serializeTiddlyWikiFootnote.call(this, block);
    case 'raw':
      return this.serializeRaw(block);
  }
}
