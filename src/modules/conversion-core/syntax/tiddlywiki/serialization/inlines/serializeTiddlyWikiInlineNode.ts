import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiSerializationContext } from '../context/types/TiddlyWikiSerializationContext';
import { escapeTiddlyWikiText } from '../escaping/escapeTiddlyWikiText';
import { serializeTiddlyWikiInlineCode } from './code/serializeTiddlyWikiInlineCode';
import { serializeTiddlyWikiHighlight } from './formatting/serializeTiddlyWikiHighlight';
import { serializeTiddlyWikiLink } from './links/serializeTiddlyWikiLink';
import { serializeTiddlyWikiEmbed } from './images/serializeTiddlyWikiEmbed';

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
