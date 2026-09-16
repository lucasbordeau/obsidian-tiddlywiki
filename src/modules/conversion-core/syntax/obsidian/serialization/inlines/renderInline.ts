import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { escapeText } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeText';
import { serializeCodeSpan } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeCodeSpan';
import { needsStaticFormatting } from '@/modules/conversion-core/syntax/obsidian/serialization/formatting/needsStaticFormatting';
import { renderHtmlInlines } from '@/modules/conversion-core/syntax/obsidian/serialization/renderHtmlInlines';
import { renderLink } from '@/modules/conversion-core/syntax/obsidian/serialization/links/renderLink';
import { renderEmbed } from '@/modules/conversion-core/syntax/obsidian/serialization/links/renderEmbed';
import { emitRaw } from '@/modules/conversion-core/syntax/obsidian/serialization/emitRaw';

export function renderInline(
  node: InlineNode,
  context: SerializationContext,
  marker?: string,
): string {
  switch (node.type) {
    case 'text':
      return escapeText(node.value);
    case 'code':
      return serializeCodeSpan(node.value);
    case 'strong': {
      if (needsStaticFormatting(node)) {
        return renderHtmlInlines([node], context);
      }

      const delimiter = marker ?? '**';

      return `${delimiter}${context.renderInlines(node.children, delimiter[0])}${delimiter}`;
    }

    case 'emphasis': {
      if (needsStaticFormatting(node)) {
        return renderHtmlInlines([node], context);
      }

      const delimiter = marker ?? '_';

      return `${delimiter}${context.renderInlines(node.children, delimiter[0])}${delimiter}`;
    }

    case 'strike':
      return `~~${context.renderInlines(node.children)}~~`;
    case 'highlight':
      return `==${context.renderInlines(node.children)}==`;
    case 'underline':
      return `<u>${renderHtmlInlines(node.children, context)}</u>`;
    case 'superscript':
      return `<sup>${renderHtmlInlines(node.children, context)}</sup>`;
    case 'subscript':
      return `<sub>${renderHtmlInlines(node.children, context)}</sub>`;
    case 'link':
      return renderLink(node, context);
    case 'embed':
      return renderEmbed(node, context);
    case 'break':
      return node.hard ? '  \n' : '\n';
    case 'math':
      return `$${node.value}$`;
    case 'footnoteReference':
      return `[^${node.identifier}]`;
    case 'raw':
      return emitRaw(node, context);
  }
}
