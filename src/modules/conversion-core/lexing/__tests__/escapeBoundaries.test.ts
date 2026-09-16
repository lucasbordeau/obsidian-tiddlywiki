import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';

describe('Obsidian escape boundaries', () => {
  test('ASCII punctuation after a backslash is one escape token', () => {
    const source = '\\*';
    const rendered = createObsidianParser().renderInline(source);
    const tokens = lexSource(source, 'obsidian');

    expect(rendered).toBe('*');

    expect(tokens).toEqual([
      { kind: 'escape', range: { start: 0, end: source.length }, raw: source },
    ]);
  });

  test('a letter after a backslash stays literal text', () => {
    const source = '\\a';
    const rendered = createObsidianParser().renderInline(source);
    const tokens = lexSource(source, 'obsidian');

    expect(rendered).toBe(source);
    expect(tokens.filter((token) => token.kind === 'escape')).toEqual([]);
  });

  test('a backslash does not split an astral character into separate tokens', () => {
    const source = '\\🙂';
    const rendered = createObsidianParser().renderInline(source);
    const tokens = lexSource(source, 'obsidian');
    const middleOfEmoji = source.indexOf('🙂') + 1;

    expect(rendered).toBe(source);
    expect(tokens.filter((token) => token.kind === 'escape')).toEqual([]);

    expect(
      tokens.some(
        (token) =>
          token.range.start === middleOfEmoji ||
          token.range.end === middleOfEmoji,
      ),
    ).toBe(false);
  });

  test('a backslash and CRLF form one escaped line break', () => {
    const source = '\\\r\nnext';
    const rendered = createObsidianParser().renderInline(source);
    const tokens = lexSource(source, 'obsidian');

    expect(rendered).toContain('<br>');

    expect(tokens[0]).toEqual({
      kind: 'escape',
      range: { start: 0, end: 3 },
      raw: '\\\r\n',
    });
  });
});
