import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';

describe('lexer recovery and TiddlyWiki delimiter boundaries', () => {
  test('an unclosed macro leaves a later wiki link available', () => {
    const source = '<<bad\n\n[[good]]';

    const parsed = parseTiddlyWiki(source);
    const tokens = lexSource(source, 'tiddlywiki');

    expect(parsed.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'paragraph',
          children: expect.arrayContaining([
            expect.objectContaining({ type: 'link', target: 'good' }),
          ]),
        }),
      ]),
    );

    expect(tokens.filter((token) => token.kind === 'macro')).toEqual([]);

    expect(tokens.filter((token) => token.kind === 'link')).toEqual([
      expect.objectContaining({ kind: 'link', raw: '[[good]]' }),
    ]);
  });

  test('an unclosed Obsidian wiki link does not consume the next line', () => {
    const source = '[[unfinished\n[[valid]]';

    const parsed = parseObsidian(source);
    const tokens = lexSource(source, 'obsidian');

    expect(parsed.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'paragraph',
          children: expect.arrayContaining([
            expect.objectContaining({ type: 'link', target: 'valid' }),
          ]),
        }),
      ]),
    );

    expect(tokens.filter((token) => token.kind === 'link')).toEqual([
      expect.objectContaining({ kind: 'link', raw: '[[valid]]' }),
    ]);
  });

  test('a TiddlyWiki backslash does not escape a wiki link closer', () => {
    const source = '[[C:\\]] [[real]]';

    const parsed = parseTiddlyWiki(source);
    const tokens = lexSource(source, 'tiddlywiki');

    expect(parsed.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'paragraph',
          children: expect.arrayContaining([
            expect.objectContaining({ type: 'link', target: 'C:\\' }),
            expect.objectContaining({ type: 'link', target: 'real' }),
          ]),
        }),
      ]),
    );

    expect(tokens.filter((token) => token.kind === 'link')).toEqual([
      expect.objectContaining({ kind: 'link', raw: '[[C:\\]]' }),
      expect.objectContaining({ kind: 'link', raw: '[[real]]' }),
    ]);
  });

  test('a bracketed macro parameter shields an internal closing delimiter', () => {
    const macro = '<<foo [[abc >> def]]>>';
    const source = `${macro} [[after]]`;

    const parsed = parseTiddlyWiki(source);
    const tokens = lexSource(source, 'tiddlywiki');

    expect(parsed.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'paragraph',
          children: expect.arrayContaining([
            expect.objectContaining({ type: 'raw', value: macro }),
            expect.objectContaining({ type: 'link', target: 'after' }),
          ]),
        }),
      ]),
    );

    expect(tokens.filter((token) => token.kind === 'macro')).toEqual([
      expect.objectContaining({ kind: 'macro', raw: macro }),
    ]);

    expect(tokens.filter((token) => token.kind === 'link')).toEqual([
      expect.objectContaining({ kind: 'link', raw: '[[after]]' }),
    ]);
  });
});
