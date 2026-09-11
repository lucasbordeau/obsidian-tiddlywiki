import { encodePreservedSource } from '../../../../modules/conversion-core/preservation/source/encodePreservedSource';
import { parseObsidianBlocks } from '../../../support/parseObsidianBlocks';

describe('Obsidian documented extensions and structural regressions', () => {
  test('parses adjacent inline preservation comments as a paragraph at a list boundary', () => {
    const first = {
      dialect: 'tiddlywiki' as const,
      value: '{{a.png}}',
      reason: 'Image-like transclusion',
    };

    const second = {
      dialect: 'tiddlywiki' as const,
      value: '{{b.png}}',
      reason: 'Image-like transclusion',
    };

    const source = `- ${encodePreservedSource(first)} then ${encodePreservedSource(second)}`;

    expect(parseObsidianBlocks(source)).toMatchObject([
      {
        type: 'list',
        children: [
          {
            blocks: [
              {
                type: 'paragraph',
                children: [
                  { type: 'raw', ...first },
                  { type: 'text', value: ' then ' },
                  { type: 'raw', ...second },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});
