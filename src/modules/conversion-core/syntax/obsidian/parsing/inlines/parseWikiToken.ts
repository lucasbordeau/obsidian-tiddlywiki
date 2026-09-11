import type { Token } from '../../types/Token';
import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { parseWikiReferenceParts } from './parseWikiReferenceParts';

export function parseWikiToken(token: Token): InlineNode {
  const { target, alias } = parseWikiReferenceParts(token.content);

  if (token.type === 'otw_wikilink') {
    return {
      type: 'link',
      target,
      label: [{ type: 'text', value: alias ?? target }],
      external: false,
    };
  }

  const dimensions = /^(\d+)(?:x(\d+))?$/.exec(alias ?? '');

  const imageTarget =
    /\.(?:avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)(?:#.*)?$/i.test(target);

  const embed: InlineNode = {
    type: 'embed',
    target,
    kind: imageTarget ? 'image' : 'note',
    alt: dimensions ? '' : (alias ?? ''),
  };

  if (dimensions) {
    embed.width = dimensions[1];

    if (dimensions[2]) {
      embed.height = dimensions[2];
    }
  }

  return embed;
}
