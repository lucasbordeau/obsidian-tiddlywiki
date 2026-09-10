import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { ParsedDocument } from '../../../../../modules/conversion-core/model/ast/documents/ParsedDocument';
import { blocksOf } from '../../../../support/syntax/obsidian/blocksOf';

describe('Obsidian documented extensions and structural regressions', () => {
  test('keeps repeated thematic rules distinct from YAML front matter', () => {
    const document = parseObsidian('***\n\n- - -\n\n___');

    const serialized = serializeObsidian(document);

    expect(serialized.text).toBe('***\n\n***\n\n***');

    expect(blocksOf(serialized.text)).toEqual([
      { type: 'thematicBreak' },
      { type: 'thematicBreak' },
      { type: 'thematicBreak' },
    ]);
  });

  test('escapes a list-looking paragraph even when entity decoding split the text nodes', () => {
    const document: ParsedDocument = {
      dialect: 'tiddlywiki',
      source: '',
      tokens: [],
      diagnostics: [],
      blocks: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'Text\n' },
            { type: 'text', value: '-' },
            { type: 'text', value: ' literal marker' },
          ],
        },
      ],
    };

    expect(blocksOf(serializeObsidian(document).text)).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Text' },
          { type: 'break', hard: false },
          { type: 'text', value: '- literal marker' },
        ],
      },
    ]);

    expect(document.blocks[0]).toMatchObject({
      children: [
        { value: 'Text\n' },
        { value: '-' },
        { value: ' literal marker' },
      ],
    });
  });

  test.each([true, false])(
    'preserves consecutive separate list blocks (ordered=%s)',
    (ordered) => {
      const document: ParsedDocument = {
        dialect: 'tiddlywiki',
        source: '',
        tokens: [],
        diagnostics: [],
        blocks: ['first', 'second', 'third'].map((value) => ({
          type: 'list',
          ordered,
          start: 1,
          children: [
            {
              blocks: [
                { type: 'paragraph', children: [{ type: 'text', value }] },
              ],
            },
          ],
        })),
      };

      expect(blocksOf(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );
});
