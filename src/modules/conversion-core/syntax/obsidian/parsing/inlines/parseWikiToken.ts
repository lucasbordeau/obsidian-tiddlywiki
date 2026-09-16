import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { parseWikiReferenceParts } from '@/modules/conversion-core/syntax/obsidian/parsing/inlines/parseWikiReferenceParts';

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

  const sizedImage = imageTarget && dimensions !== null;
  const labelledImage = imageTarget && alias !== undefined;
  const imageEmbed = sizedImage || labelledImage;

  const embed: InlineNode = {
    type: 'embed',
    target,
    kind: imageEmbed ? 'image' : 'transclusion',
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
