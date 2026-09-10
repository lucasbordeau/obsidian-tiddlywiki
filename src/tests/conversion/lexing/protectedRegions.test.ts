import { lexSource } from '../../../modules/conversion-core/lexing/lexSource';
import { imageWidgetSources } from './cases/imageWidgetSources';

describe('concrete source tokens', () => {
  test.each(imageWidgetSources)(
    'TW image attributes protect their own quoted and dynamic delimiters: %s',
    (source) => {
      const tokens = lexSource(`${source} [[outside]]`, 'tiddlywiki');

      expect(tokens[0]).toMatchObject({ kind: 'embed', raw: source });

      expect(
        tokens
          .filter((token) => token.kind === 'link')
          .map((token) => token.raw),
      ).toEqual(['[[outside]]']);
    },
  );

  test('a longer Markdown fence shields shorter fences, links and every formatting delimiter', () => {
    const source =
      '````md\r\n```tw\r\n[[literal|target]] {{macro}} ** _ ==\r\n```\r\n````\r\n[[real]]';

    const tokens = lexSource(source, 'obsidian');

    expect(tokens[0].kind).toBe('code');
    expect(tokens[0].raw).toContain('[[literal|target]]');

    expect(
      tokens.filter((token) => token.kind === 'link').map((token) => token.raw),
    ).toEqual(['[[real]]']);
  });

  test('quoted Markdown fences preserve embedded quote and list markers as one code region', () => {
    const source = '> ```tw\n> *# [[literal]]\n> ```\n\n[[outside]]';

    const tokens = lexSource(source, 'obsidian');

    expect(tokens.filter((token) => token.kind === 'code')).toHaveLength(1);

    expect(
      tokens.filter((token) => token.kind === 'link').map((token) => token.raw),
    ).toEqual(['[[outside]]']);
  });

  test('TW quoted parameters shield tag and macro closing delimiters', () => {
    const source =
      '<$text text="a > b"/> <<macro "inside >> quote">> /% [[comment]] %/';

    const tokens = lexSource(source, 'tiddlywiki');

    expect(
      tokens
        .filter((token) => token.kind === 'widget')
        .map((token) => token.raw),
    ).toEqual(['<$text text="a > b"/>']);

    expect(
      tokens
        .filter((token) => token.kind === 'macro')
        .map((token) => token.raw),
    ).toEqual(['<<macro "inside >> quote">>']);

    expect(tokens.filter((token) => token.kind === 'link')).toHaveLength(0);
  });
});
