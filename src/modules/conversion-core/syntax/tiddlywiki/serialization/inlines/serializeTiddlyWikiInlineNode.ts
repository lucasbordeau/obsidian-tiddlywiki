import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/escapeTiddlyWikiText';
import { serializeTiddlyWikiInlineCode } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/inlines/serializeTiddlyWikiInlineCode';
import { serializeTiddlyWikiHighlight } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/inlines/serializeTiddlyWikiHighlight';
import { serializeTiddlyWikiLink } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/inlines/serializeTiddlyWikiLink';
import { serializeTiddlyWikiEmbed } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/inlines/serializeTiddlyWikiEmbed';

export function serializeTiddlyWikiInlineNode(
  this: TiddlyWikiSerializationContext,
  node: InlineNode,
): string {
  switch (node.type) {
    case 'text':
      return escapeTiddlyWikiText(node.value);
    case 'break':
      return node.hard ? '<br>' : '\n';
    case 'code':
      return serializeTiddlyWikiInlineCode.call(this, node);
    case 'strong':
      return "''" + this.serializeInline(node.children) + "''";
    case 'emphasis':
      return '//' + this.serializeInline(node.children) + '//';
    case 'underline':
      return '__' + this.serializeInline(node.children) + '__';
    case 'strike':
      return '~~' + this.serializeInline(node.children) + '~~';
    case 'highlight':
      return serializeTiddlyWikiHighlight.call(this, node);
    case 'superscript':
      return '^^' + this.serializeInline(node.children) + '^^';
    case 'subscript':
      return ',,' + this.serializeInline(node.children) + ',,';
    case 'link':
      return serializeTiddlyWikiLink.call(this, node);
    case 'embed':
      return serializeTiddlyWikiEmbed.call(this, node);
    case 'math':
      return this.preserve(
        node,
        'Math requires a compatible TiddlyWiki rendering plugin; the original source is retained.',
      );
    case 'footnoteReference':
      return `<sup><a href="#footnote-${encodeURIComponent(node.identifier)}">${escapeTiddlyWikiText(node.identifier)}</a></sup>`;
    case 'raw':
      return this.serializeRaw(node);
  }
}
