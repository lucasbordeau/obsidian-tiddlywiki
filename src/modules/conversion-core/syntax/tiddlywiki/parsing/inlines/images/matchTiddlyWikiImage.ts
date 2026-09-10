import type { InlineNode } from '../../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiImage(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): TiddlyWikiInlineMatch {
  const contentStart = this.findImageContentStart(start, end);
  const closing = this.source.indexOf(']]', contentStart + 1);
  const closed = contentStart < end && closing >= 0 && closing + 2 <= end;

  if (!closed) {
    return {
      node: this.rawInline(start, end, 'The image syntax is unfinished.'),
      end,
    };
  }

  const final = closing + 2;
  const attributes = this.source.slice(start + 4, contentStart).trim();
  const value = this.source.slice(contentStart + 1, closing);
  const separator = value.indexOf('|');
  const target = (separator < 0 ? value : value.slice(separator + 1)).trim();
  const tooltip = separator < 0 ? undefined : value.slice(0, separator).trim();

  const node: Extract<InlineNode, { type: 'embed' }> = {
    type: 'embed',
    target,
    alt: '',
    kind: 'image',
    range: { start, end: final },
  };

  const attributePattern =
    /\s*(width|height|alt|tooltip)\s*=\s*(?:"""([\s\S]*?)"""|"([^"\n]*)"|'([^'\n]*)'|([^\s]+))/gy;

  let position = 0;

  while (position < attributes.length) {
    attributePattern.lastIndex = position;

    const attribute = attributePattern.exec(attributes);

    if (!attribute) {
      return {
        node: this.rawInline(
          start,
          final,
          'Dynamic or extended image attributes retain their original syntax.',
        ),
        end: final,
      };
    }

    const attributeValue =
      attribute[2] ?? attribute[3] ?? attribute[4] ?? attribute[5];

    const dimension = attribute[1] === 'width' || attribute[1] === 'height';

    if (dimension && !/^\d+(?:\.\d+)?(?:px|%)?$/.test(attributeValue)) {
      return {
        node: this.rawInline(
          start,
          final,
          'The image size is dynamic or uses an unsupported unit.',
        ),
        end: final,
      };
    }

    if (attribute[1] === 'width') {
      node.width = attributeValue;
    } else if (attribute[1] === 'height') {
      node.height = attributeValue;
    } else if (attribute[1] === 'alt') {
      node.alt = attributeValue;
    } else {
      node.title = attributeValue;
    }

    position = attributePattern.lastIndex;
  }

  if (tooltip) {
    node.title = tooltip;
  }

  return { node, end: final };
}
