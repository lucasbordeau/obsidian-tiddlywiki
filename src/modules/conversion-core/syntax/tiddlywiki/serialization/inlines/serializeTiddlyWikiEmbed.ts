import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';
import { quoteTiddlyWikiAttribute } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/quoteTiddlyWikiAttribute';

export function serializeTiddlyWikiEmbed(
  this: TiddlyWikiSerializationContext,
  node: Extract<InlineNode, { type: 'embed' }>,
): string {
  const externalTarget = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.target);

  const target =
    !externalTarget && this.options.resolveLink
      ? this.options.resolveLink(node.target, 'embed')
      : node.target;

  if (node.kind === 'transclusion') {
    const hasDisplayOptions =
      node.alt.length > 0 ||
      node.width !== undefined ||
      node.height !== undefined ||
      node.title !== undefined;

    const needsPreservation = /[{}|#]/.test(target) || hasDisplayOptions;

    if (needsPreservation) {
      return this.preserve(
        node,
        'The transclusion needs block, heading or display-option mapping before conversion.',
      );
    }

    return '{{' + target + '}}';
  }

  const needsWidget =
    /[\]|\r\n]/.test(target) || /[\]|\r\n]/.test(node.title ?? '');

  const altAttribute = quoteTiddlyWikiAttribute(node.alt);

  if (!altAttribute) {
    return this.preserve(
      node,
      'The alternative image text uses an unsupported attribute delimiter.',
    );
  }

  const includeAlt =
    node.alt.length > 0 || this.document.dialect === 'obsidian';

  if (needsWidget) {
    const sourceAttribute = quoteTiddlyWikiAttribute(target);
    const tooltipAttribute = quoteTiddlyWikiAttribute(node.title ?? '');

    if (!sourceAttribute || !tooltipAttribute) {
      return this.preserve(
        node,
        'The image attributes require an unsupported quoting form.',
      );
    }

    let attributes = ` source=${sourceAttribute} tooltip=${tooltipAttribute}`;

    if (includeAlt) {
      attributes += ' alt=' + altAttribute;
    }

    if (node.width) {
      attributes += ' width=' + quoteTiddlyWikiAttribute(node.width);
    }

    if (node.height) {
      attributes += ' height=' + quoteTiddlyWikiAttribute(node.height);
    }

    return '<$image' + attributes + '/>';
  }

  let attributes = '';

  if (includeAlt) {
    attributes += ' alt=' + altAttribute;
  }

  if (node.title === '') {
    attributes += ' tooltip=""';
  }

  if (node.width) {
    attributes += ' width=' + quoteTiddlyWikiAttribute(node.width);
  }

  if (node.height) {
    attributes += ' height=' + quoteTiddlyWikiAttribute(node.height);
  }

  return (
    '[img' +
    attributes +
    '[' +
    (node.title ? node.title + '|' : '') +
    target +
    ']]'
  );
}
