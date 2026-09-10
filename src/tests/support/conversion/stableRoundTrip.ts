import { convertText } from '../../../modules/conversion-core/conversion/convertText';
import { parseObsidian } from '../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { semanticBlocks } from '../ast/comparison/semanticBlocks';

export function stableRoundTrip(source: string): string {
  const expected = semanticBlocks(parseObsidian(source).blocks);

  let markdown = source;

  for (let cycle = 0; cycle < 3; cycle++) {
    const outgoing = convertText(markdown, 'obsidian', 'tiddlywiki');

    markdown = convertText(outgoing.text, 'tiddlywiki', 'obsidian').text;

    expect(semanticBlocks(parseObsidian(markdown).blocks)).toEqual(expected);
  }

  return markdown;
}
