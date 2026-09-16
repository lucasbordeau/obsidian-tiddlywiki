import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';
import { serializeTiddlyWikiCodeBlock } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiCodeBlock';
import { serializeTiddlyWikiQuoteBlock } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiQuoteBlock';
import { serializeTiddlyWikiListBlock } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiListBlock';
import { serializeTiddlyWikiTable } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiTable';
import { serializeTiddlyWikiFootnote } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiFootnote';

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
