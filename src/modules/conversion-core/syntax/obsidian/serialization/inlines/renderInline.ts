import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { SerializationContext } from '../../types/SerializationContext';
import { escapeText } from '../escaping/escapeText';
import { serializeCodeSpan } from '../serializeCodeSpan';
import { needsStaticFormatting } from '../formatting/needsStaticFormatting';
import { renderHtmlInlines } from '../renderHtmlInlines';
import { renderLink } from '../links/renderLink';
import { renderEmbed } from '../links/renderEmbed';
import { emitRaw } from '../emitRaw';

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
