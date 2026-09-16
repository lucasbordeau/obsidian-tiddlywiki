import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { Dialect } from '@/modules/conversion-core/model/Dialect';
import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';

/** Measure the median after a warmup so one GC pause cannot decide the ratio. */
function measureMedianLexingMilliseconds(
  source: string,
  dialect: Dialect,
): number {
  const elapsedMilliseconds: number[] = [];

  lexSource(source, dialect);

  for (let attempt = 0; attempt < 5; attempt++) {
    const start = performance.now();

    lexSource(source, dialect);

    elapsedMilliseconds.push(performance.now() - start);
  }

  elapsedMilliseconds.sort((left, right) => left - right);

  return elapsedMilliseconds[2];
}

describe('unfinished HTML tag recovery', () => {
  test('nested malformed openers leave a following Markdown link visible', () => {
    const malformedPrefix = '<a '.repeat(8);
    const source = `${malformedPrefix}\n[x](foo)`;
    const parserTokens = createObsidianParser().parse(source, {});
    const inlineTokens = parserTokens[1].children ?? [];

    expect(inlineTokens.map((token) => token.type)).toContain('link_open');

    const lexerTokens = lexSource(source, 'obsidian');

    expect(lexerTokens.filter((token) => token.kind === 'html')).toEqual([]);

    expect(lexerTokens.filter((token) => token.kind === 'link')).toEqual([
      {
        kind: 'link',
        range: { start: malformedPrefix.length + 1, end: source.length },
        raw: '[x](foo)',
      },
    ]);
  });

  test('a quoted opening angle remains inside a valid HTML attribute', () => {
    const htmlTag = '<a title="<a">';
    const source = `before ${htmlTag} after`;
    const parserTokens = createObsidianParser().parse(source, {});
    const inlineTokens = parserTokens[1].children ?? [];

    expect(
      inlineTokens.find((token) => token.type === 'html_inline')?.content,
    ).toBe(htmlTag);

    const lexerTokens = lexSource(source, 'obsidian');

    expect(lexerTokens.filter((token) => token.kind === 'html')).toEqual([
      {
        kind: 'html',
        range: { start: 7, end: 7 + htmlTag.length },
        raw: htmlTag,
      },
    ]);
  });

  test.each([
    '<$transclude $tiddler=<<target>>/>',
    '<$text text=<<foo [[a >> b]]>>/>',
  ])('keeps a TiddlyWiki macro attribute inside its widget: %s', (source) => {
    const parsed = parseTiddlyWiki(source);

    expect(parsed.blocks).toHaveLength(1);
    expect(parsed.blocks[0].range).toEqual({ start: 0, end: source.length });

    if (parsed.blocks[0].type === 'raw') {
      expect(parsed.blocks[0].value).toBe(source);
    } else {
      expect(parsed.blocks[0]).toMatchObject({
        type: 'paragraph',
        children: [expect.objectContaining({ type: 'raw', value: source })],
      });
    }

    expect(lexSource(source, 'tiddlywiki')).toEqual([
      { kind: 'widget', range: { start: 0, end: source.length }, raw: source },
    ]);
  });

  test.each([
    {
      source: '<div class={{{ [<size>multiply[2]] }}}>content</div>',
      opening: '<div class={{{ [<size>multiply[2]] }}}>',
    },
    {
      source: '<div title=`Prefix <name>`>content</div>',
      opening: '<div title=`Prefix <name>`>',
    },
  ])(
    'protects a TiddlyWiki dynamic attribute inside an HTML tag: $source',
    ({ source, opening }) => {
      const parsed = parseTiddlyWiki(source);

      expect(parsed.blocks).toEqual([
        expect.objectContaining({
          type: 'raw',
          value: source,
          range: { start: 0, end: source.length },
        }),
      ]);

      expect(lexSource(source, 'tiddlywiki')[0]).toEqual({
        kind: 'html',
        range: { start: 0, end: opening.length },
        raw: opening,
      });
    },
  );

  test.each([
    ['Obsidian unquoted', 'obsidian' as const, '<a '],
    ['Obsidian quoted', 'obsidian' as const, '<a title="'],
    ['TiddlyWiki unquoted', 'tiddlywiki' as const, '<a '],
  ])(
    'repeated malformed %s tags scale below a quadratic growth ratio',
    (_, dialect, opener) => {
      const followingLink =
        dialect === 'tiddlywiki' ? '[[outside]]' : '[x](foo)';

      const shorterSource = `${opener.repeat(2000)}\n${followingLink}`;
      const longerSource = `${opener.repeat(4000)}\n${followingLink}`;

      const shorterMilliseconds = measureMedianLexingMilliseconds(
        shorterSource,
        dialect,
      );

      const longerMilliseconds = measureMedianLexingMilliseconds(
        longerSource,
        dialect,
      );

      const growthRatio = longerMilliseconds / shorterMilliseconds;

      expect(growthRatio).toBeLessThan(3.2);

      expect(
        lexSource(longerSource, dialect)
          .filter((token) => token.kind === 'link')
          .map((token) => token.raw),
      ).toEqual([followingLink]);
    },
    20_000,
  );
});
