import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';
import { quoteTiddlyWikiAttribute } from '../quoteTiddlyWikiAttribute';

export function serializeTiddlyWikiLink(
  this: TiddlyWikiSerializationContext,
  node: Extract<InlineNode, { type: 'link' }>,
): string {
  const target =
    !node.external && this.options.resolveLink
      ? this.options.resolveLink(node.target, 'link')
      : node.target;

  const textLabel = node.label.every((child) => child.type === 'text');

  const label = textLabel
    ? node.label
        .map((child) => (child.type === 'text' ? child.value : ''))
        .join('')
    : '';

  const needsWidget =
    !textLabel ||
    /\]\]|[\r\n]/.test(target) ||
    /[|\r\n]|\]\]/.test(label) ||
    node.title !== undefined;

  if (needsWidget) {
    const attribute = quoteTiddlyWikiAttribute(target);

    if (!attribute) {
      return this.preserve(
        node,
        'The link target requires a quoting form outside the supported TW attribute subset.',
      );
    }

    if (node.external) {
      const titleAttribute =
        node.title === undefined
          ? undefined
          : quoteTiddlyWikiAttribute(node.title);

      if (node.title !== undefined && !titleAttribute) {
        return this.preserve(
          node,
          'The link title uses an unsupported attribute delimiter.',
        );
      }

      const title =
        titleAttribute === undefined ? '' : ` title=${titleAttribute}`;

      return `<a href=${attribute}${title}>${this.serializeInline(node.label)}</a>`;
    }

    const tooltipAttribute =
      node.title === undefined
        ? undefined
        : quoteTiddlyWikiAttribute(node.title);

    if (node.title !== undefined && !tooltipAttribute) {
      return this.preserve(
        node,
        'The link title uses an unsupported attribute delimiter.',
      );
    }

    const tooltip =
      tooltipAttribute === undefined ? '' : ' tooltip=' + tooltipAttribute;

    return `<$link to=${attribute}${tooltip}>${this.serializeInline(node.label)}</$link>`;
  }

  const prefix = node.external ? '[ext[' : '[[';

  return prefix + (label === target ? target : label + '|' + target) + ']]';
}
