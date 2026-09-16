import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { parseObsidianBlocks } from '@/testing/support/parseObsidianBlocks';
import { normalizeSemanticBlocks } from '@/testing/support/ast/normalizeSemanticBlocks';

describe('Obsidian documented extensions and structural regressions', () => {
  test('keeps repeated thematic rules distinct from YAML front matter', () => {
    const document = parseObsidian('***\n\n- - -\n\n___');

    const serialized = serializeObsidian(document);

    expect(serialized.text).toBe('***\n\n***\n\n***');

    expect(parseObsidianBlocks(serialized.text)).toEqual([
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

    expect(parseObsidianBlocks(serializeObsidian(document).text)).toEqual([
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

  test('keeps punctuation adjacent to formatting readable', () => {
    const source = "''Bold'', //italic//; ~~strike~~: done!";

    const converted = serializeObsidian(parseTiddlyWiki(source));

    expect(converted.text).toBe('**Bold**, _italic_; ~~strike~~: done\\!');
    expect(converted.text).not.toMatch(/&#\d+;/);
  });

  test('protects formatting boundaries next to word characters', () => {
    const source = "prefix''Bold''suffix";

    const converted = serializeObsidian(parseTiddlyWiki(source));

    expect(parseObsidianBlocks(converted.text)).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'prefix' },
          { type: 'strong', children: [{ type: 'text', value: 'Bold' }] },
          { type: 'text', value: 'suffix' },
        ],
      },
    ]);
  });

  test('uses tight four-space indentation for nested TiddlyWiki lists', () => {
    const source = [
      '# first',
      '#* child',
      '#** grandchild',
      '#* second child',
      '# second',
    ].join('\n');

    const converted = serializeObsidian(parseTiddlyWiki(source));

    expect(converted.text).toBe(
      [
        '1. first',
        '    - child',
        '        - grandchild',
        '    - second child',
        '2. second',
      ].join('\n'),
    );

    expect(
      normalizeSemanticBlocks(parseObsidianBlocks(converted.text)),
    ).toEqual(normalizeSemanticBlocks(parseTiddlyWiki(source).blocks));
  });

  test('keeps mixed nested list kinds adjacent without empty lines', () => {
    const source = [
      '* content',
      '*# ordered child',
      '*#* unordered grandchild',
      '*## ordered grandchild',
    ].join('\n');

    const converted = serializeObsidian(parseTiddlyWiki(source));

    expect(converted.text).toBe(
      [
        '- content',
        '    1. ordered child',
        '        - unordered grandchild',
        '        1. ordered grandchild',
      ].join('\n'),
    );

    expect(
      normalizeSemanticBlocks(parseObsidianBlocks(converted.text)),
    ).toEqual(normalizeSemanticBlocks(parseTiddlyWiki(source).blocks));
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

      expect(parseObsidianBlocks(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );
});
