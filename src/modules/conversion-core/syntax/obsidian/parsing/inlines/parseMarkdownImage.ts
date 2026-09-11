import type { Token } from '../../types/Token';
import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { getInlinePlainText } from './getInlinePlainText';
import { isObsidianWebEmbed } from '../../rules/inline/isObsidianWebEmbed';
import { createRawInline } from './createRawInline';

export function parseMarkdownImage(
  token: Token,
  children: InlineNode[],
): InlineNode {
  const alt = getInlinePlainText(children);

  const embed: InlineNode = {
    type: 'embed',
    target: token.attrGet('src') ?? '',
    alt,
    kind: 'image',
  };

  const title = token.attrGet('title');

  if (title !== null) {
    embed.title = title;
  }

  if (isObsidianWebEmbed(embed.target)) {
    const titleSuffix =
      title === null ? '' : ` "${title.replace(/"/g, '\\"')}"`;

    return createRawInline(
      `![${token.content}](<${embed.target}>${titleSuffix})`,
      'Obsidian web embed',
    );
  }

  const separator = token.content.lastIndexOf('|');
  let precedingBackslashes = 0;

  for (
    let position = separator - 1;
    position >= 0 && token.content[position] === '\\';
    position--
  ) {
    precedingBackslashes++;
  }

  const literalPipe = separator !== -1 && precedingBackslashes % 2 === 1;

  const dimensionText =
    separator === -1 ? token.content : token.content.slice(separator + 1);

  const dimensions = /^(\d+)(?:x(\d+))?$/.exec(dimensionText);

  if (!dimensions || literalPipe) {
    return embed;
  }

  embed.alt = separator === -1 ? '' : alt.slice(0, -(dimensionText.length + 1));
  embed.width = dimensions[1];

  if (dimensions[2] !== undefined) {
    embed.height = dimensions[2];
  }

  return embed;
}
