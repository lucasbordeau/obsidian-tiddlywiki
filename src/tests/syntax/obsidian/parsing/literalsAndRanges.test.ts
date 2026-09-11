import { parseObsidian } from '../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { parseObsidianBlocks } from '../../../support/parseObsidianBlocks';

describe('Obsidian structural parsing', () => {
  test('protects four-plus and tilde fences, indented code and shorter interior delimiters', () => {
    const source =
      '`````markdown extra\n```\n**unchanged** [[not a link]] ==not a highlight==\n```\n`````\n\n~~~~ts\n$not math$\n~~~~\n\n    [[indented literal]]\n';

    const blocks = parseObsidianBlocks(source);

    expect(blocks).toEqual([
      {
        type: 'code',
        language: 'markdown extra',
        value: '```\n**unchanged** [[not a link]] ==not a highlight==\n```',
      },
      { type: 'code', language: 'ts', value: '$not math$' },
      { type: 'code', language: '', value: '[[indented literal]]' },
    ]);
  });

  test('keeps CRLF source offsets and lossless lexical coverage', () => {
    const source = '# Heading\r\n\r\nText **bold**\r\n';

    const document = parseObsidian(source);

    expect(document.blocks[0].range).toEqual({ start: 0, end: 11 });
    expect(document.blocks[1].range).toEqual({ start: 13, end: source.length });
    expect(document.tokens.map((token) => token.raw).join('')).toBe(source);

    for (const token of document.tokens) {
      expect(source.slice(token.range.start, token.range.end)).toBe(token.raw);
    }
  });
});
