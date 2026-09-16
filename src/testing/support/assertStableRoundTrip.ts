import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { normalizeSemanticBlocks } from '@/testing/support/ast/normalizeSemanticBlocks';

export function assertStableRoundTrip(source: string): string {
  const expected = normalizeSemanticBlocks(parseObsidian(source).blocks);

  let markdown = source;

  for (let cycle = 0; cycle < 3; cycle++) {
    const outgoing = convertText(markdown, 'obsidian', 'tiddlywiki');

    markdown = convertText(outgoing.text, 'tiddlywiki', 'obsidian').text;

    expect(normalizeSemanticBlocks(parseObsidian(markdown).blocks)).toEqual(
      expected,
    );
  }

  return markdown;
}
