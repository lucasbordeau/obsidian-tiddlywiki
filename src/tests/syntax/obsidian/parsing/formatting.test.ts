import { parseObsidianBlocks } from '../../../support/parseObsidianBlocks';

describe('Obsidian structural parsing', () => {
  test('preserves nested formatting, code literals, alias identity and protected delimiters', () => {
    const blocks = parseObsidianBlocks(
      '**outer _inner_ and `**literal** [[not link]]`** ==a **highlight**== [[Folder/Note#Heading|a **literal** label]]',
    );

    expect(blocks).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'strong',
            children: [
              { type: 'text', value: 'outer ' },
              {
                type: 'emphasis',
                children: [{ type: 'text', value: 'inner' }],
              },
              { type: 'text', value: ' and ' },
              { type: 'code', value: '**literal** [[not link]]' },
            ],
          },
          { type: 'text', value: ' ' },
          {
            type: 'highlight',
            children: [
              { type: 'text', value: 'a ' },
              {
                type: 'strong',
                children: [{ type: 'text', value: 'highlight' }],
              },
            ],
          },
          { type: 'text', value: ' ' },
          {
            type: 'link',
            target: 'Folder/Note#Heading',
            label: [{ type: 'text', value: 'a **literal** label' }],
            external: false,
          },
        ],
      },
    ]);
  });

  test('ignores highlight delimiters inside complete code spans and respects exact backtick runs', () => {
    expect(
      parseObsidianBlocks('==before ``code ``` == still code`` after=='),
    ).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'highlight',
            children: [
              { type: 'text', value: 'before ' },
              { type: 'code', value: 'code ``` == still code' },
              { type: 'text', value: ' after' },
            ],
          },
        ],
      },
    ]);
  });
});
