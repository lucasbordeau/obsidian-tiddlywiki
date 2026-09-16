import { parseObsidianBlocks } from '@/testing/support/parseObsidianBlocks';

describe('Obsidian structural parsing', () => {
  test('parses CommonMark mixed lists, non-one starts, tasks and loose item blocks', () => {
    const blocks = parseObsidianBlocks(
      '7. first\n   - [x] done\n     1. nested\n   - [ ] pending\n8. second\n\n   second paragraph\n\n   ```js\n   **literal**\n   ```',
    );

    expect(blocks[0]).toMatchObject({ type: 'list', ordered: true, start: 7 });

    const outer = blocks[0];

    if (outer.type !== 'list') {
      throw new Error('Expected an ordered list');
    }

    expect(outer.children).toHaveLength(2);

    expect(outer.children[0].blocks[1]).toMatchObject({
      type: 'list',
      ordered: false,
      children: [{ checked: true }, { checked: false }],
    });

    expect(outer.children[1].blocks).toMatchObject([
      { type: 'paragraph' },
      { type: 'paragraph' },
      { type: 'code', value: '**literal**', language: 'js' },
    ]);
  });

  test('parses tables with alignment, escaped pipes, code and wikilinks', () => {
    const blocks = parseObsidianBlocks(
      '| Left | Center | Right |\n| :--- | :---: | ---: |\n| `a\\|b` | [[Folder/Note\\|label]] | **strong** |',
    );

    expect(blocks).toMatchObject([
      {
        type: 'table',
        alignments: ['left', 'center', 'right'],
        rows: [
          [
            [{ type: 'code', value: 'a|b' }],
            [
              {
                type: 'link',
                target: 'Folder/Note',
                label: [{ type: 'text', value: 'label' }],
              },
            ],
            expect.arrayContaining([
              expect.objectContaining({ type: 'strong' }),
            ]),
          ],
        ],
      },
    ]);
  });
});
