import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';

describe('angle autolinks and unfinished HTML boundaries', () => {
  test.each([
    ['URL', '<https://example.org/a?q=1&b=2>', 'https://example.org/a?q=1&b=2'],
    ['email', '<person@example.org>', 'mailto:person@example.org'],
  ])(
    'recognizes an Obsidian %s autolink as one link token',
    (_, source, href) => {
      const parserTokens = createObsidianParser().parse(source, {});
      const inlineTokens = parserTokens[1].children ?? [];

      expect(inlineTokens[0].type).toBe('link_open');
      expect(inlineTokens[0].attrGet('href')).toBe(href);

      expect(lexSource(source, 'obsidian')).toEqual([
        { kind: 'link', range: { start: 0, end: source.length }, raw: source },
      ]);
    },
  );

  test('an unfinished Obsidian HTML attribute leaves a later Markdown link visible', () => {
    const source = '<tag attr="unfinished\n[x](foo)';
    const parserTokens = createObsidianParser().parse(source, {});
    const inlineTokens = parserTokens[1].children ?? [];

    expect(inlineTokens.map((token) => token.type)).toContain('link_open');

    expect(
      inlineTokens.find((token) => token.type === 'link_open')?.attrGet('href'),
    ).toBe('foo');

    const tokens = lexSource(source, 'obsidian');
    const markdownLinkStart = source.indexOf('[x](foo)');

    expect(tokens.filter((token) => token.kind === 'html')).toEqual([]);

    expect(tokens.filter((token) => token.kind === 'link')).toEqual([
      {
        kind: 'link',
        range: {
          start: markdownLinkStart,
          end: markdownLinkStart + '[x](foo)'.length,
        },
        raw: '[x](foo)',
      },
    ]);
  });

  test('a rejected protocol remains text and leaves the next link visible', () => {
    const source = '<javascript:alert(1)> [x](foo)';
    const parserTokens = createObsidianParser().parse(source, {});
    const inlineTokens = parserTokens[1].children ?? [];

    expect(inlineTokens[0]).toMatchObject({
      type: 'text',
      content: '<javascript:alert(1)> ',
    });

    expect(
      inlineTokens.find((token) => token.type === 'link_open')?.attrGet('href'),
    ).toBe('foo');

    const lexerTokens = lexSource(source, 'obsidian');

    expect(lexerTokens.filter((token) => token.kind === 'html')).toEqual([]);

    expect(lexerTokens.filter((token) => token.kind === 'link')).toEqual([
      expect.objectContaining({ kind: 'link', raw: '[x](foo)' }),
    ]);
  });
});
