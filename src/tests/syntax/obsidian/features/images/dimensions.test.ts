import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { parseObsidianBlocks } from '@/tests/support/parseObsidianBlocks';
import { stripSourceRanges as semanticBlocks } from '@/tests/support/ast/stripSourceRanges';
import { markdownImageDimensions } from '@/tests/syntax/obsidian/features/images/markdownImageDimensions';

describe('Obsidian documented extensions and structural regressions', () => {
  test.each(markdownImageDimensions)(
    'separates true alternate text and dimensions: %s',
    (source, alt, width, height) => {
      const document = parseObsidian(source as string);
      const paragraph = document.blocks[0];

      if (paragraph.type !== 'paragraph') {
        throw new Error('Expected an image paragraph');
      }

      expect(paragraph.children[0]).toMatchObject({ type: 'embed', alt });

      const embed = paragraph.children[0];

      if (embed.type !== 'embed') {
        throw new Error('Expected an image');
      }

      expect(embed.width).toBe(width);
      expect(embed.height).toBe(height);

      expect(
        semanticBlocks(parseObsidian(serializeObsidian(document).text).blocks),
      ).toEqual(semanticBlocks(document.blocks));
    },
  );

  test('keeps numeric literal HTML alt independent from dimensions, including title', () => {
    const document = parseObsidian(
      '<img src="chart.svg" alt="250" title="An actual numeric label">',
    );

    expect(parseObsidianBlocks(serializeObsidian(document).text)).toEqual(
      semanticBlocks(document.blocks),
    );

    expect(parseObsidianBlocks(serializeObsidian(document).text)).toMatchObject(
      [{ children: [{ alt: '250', title: 'An actual numeric label' }] }],
    );
  });
});
