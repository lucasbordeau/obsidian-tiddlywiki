import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';

describe('Markdown lexer boundaries', () => {
  test.each([
    { opening: '```', closing: '```' },
    { opening: '~~~', closing: '~~~' },
    { opening: '```', closing: '````' },
  ])(
    'a backtick inside a $opening fence cannot absorb a later link label',
    ({ opening, closing }) => {
      const reference = '[a `]` b](foo)';
      const fencedSource = [opening, '`', closing, ''].join('\n');
      const source = fencedSource + reference;
      const parserTokens = createObsidianParser().parse(source, {});

      expect(parserTokens[0].type).toBe('fence');

      expect(parserTokens[2].children?.map((token) => token.type)).toContain(
        'link_open',
      );

      const tokens = lexSource(source, 'obsidian');

      expect(tokens.filter((token) => token.kind === 'link')).toEqual([
        {
          kind: 'link',
          range: { start: fencedSource.length, end: source.length },
          raw: reference,
        },
      ]);
    },
  );

  test.each([
    {
      source: '[a `]` b](foo)',
      expectedKind: 'link',
      parserTokenType: 'link_open',
    },
    {
      source: '[a ``]`` b](foo)',
      expectedKind: 'link',
      parserTokenType: 'link_open',
    },
    {
      source: '![a `]` b](foo)',
      expectedKind: 'embed',
      parserTokenType: 'image',
    },
  ] as const)(
    'a $expectedKind label protects `]` inside same-length backtick runs: $source',
    ({ source, expectedKind, parserTokenType }) => {
      const parserTokens = createObsidianParser().parse(source, {});

      expect(parserTokens[1].children?.map((token) => token.type)).toContain(
        parserTokenType,
      );

      const tokens = lexSource(source, 'obsidian');

      expect(tokens).toEqual([
        {
          kind: expectedKind,
          range: { start: 0, end: source.length },
          raw: source,
        },
      ]);
    },
  );

  test('an apostrophe inside a bare link destination stays in the link', () => {
    const source = "[x](https://example.org/it's)";
    const parserTokens = createObsidianParser().parse(source, {});

    expect(parserTokens[1].children?.map((token) => token.type)).toContain(
      'link_open',
    );

    const tokens = lexSource(source, 'obsidian');

    expect(tokens).toEqual([
      { kind: 'link', range: { start: 0, end: source.length }, raw: source },
    ]);
  });

  test('a parenthesis inside an angle link destination stays in the link', () => {
    const source = '[x](<https://example.org/a)b>)';
    const parserTokens = createObsidianParser().parse(source, {});

    expect(parserTokens[1].children?.map((token) => token.type)).toContain(
      'link_open',
    );

    const tokens = lexSource(source, 'obsidian');

    expect(tokens).toEqual([
      { kind: 'link', range: { start: 0, end: source.length }, raw: source },
    ]);
  });

  test('a quoted fence marker does not close a top-level fence', () => {
    const source = '```\n> ```\n[[inside]]\n```\n[[outside]]';
    const parserTokens = createObsidianParser().parse(source, {});

    expect(parserTokens[0]).toMatchObject({
      type: 'fence',
      content: '> ```\n[[inside]]\n',
    });

    const tokens = lexSource(source, 'obsidian');
    const codeTokens = tokens.filter((token) => token.kind === 'code');
    const linkTokens = tokens.filter((token) => token.kind === 'link');

    expect(codeTokens).toHaveLength(1);
    expect(codeTokens[0].raw).toBe('```\n> ```\n[[inside]]\n```\n');
    expect(linkTokens.map((token) => token.raw)).toEqual(['[[outside]]']);
  });

  test('four spaces before a fence marker leave the following link outside code', () => {
    const source = '    ```\n[[after]]\n```';
    const parserTokens = createObsidianParser().parse(source, {});

    expect(parserTokens[0].type).toBe('code_block');
    expect(parserTokens[2].content).toBe('[[after]]');

    const tokens = lexSource(source, 'obsidian');

    expect(tokens.find((token) => token.range.start === 4)).toMatchObject({
      kind: 'text',
      raw: '```',
    });

    expect(tokens.filter((token) => token.kind === 'link')).toEqual([
      {
        kind: 'link',
        range: {
          start: source.indexOf('[[after]]'),
          end: source.indexOf('[[after]]') + '[[after]]'.length,
        },
        raw: '[[after]]',
      },
    ]);
  });

  test('a backtick in the fence info string leaves the following link outside code', () => {
    const source = '```js`bad\n[[visible]]\n```';
    const parserTokens = createObsidianParser().parse(source, {});

    expect(parserTokens[0].type).toBe('paragraph_open');
    expect(parserTokens[1].content).toContain('[[visible]]');

    const tokens = lexSource(source, 'obsidian');

    expect(tokens[0]).toMatchObject({ kind: 'text', raw: '```js`bad' });

    expect(
      tokens.filter((token) => token.kind === 'link').map((token) => token.raw),
    ).toEqual(['[[visible]]']);
  });

  test('a bare carriage return starts a new heading line', () => {
    const source = 'x\r# heading';
    const parserTokens = createObsidianParser().parse(source, {});

    expect(parserTokens.map((token) => token.type)).toContain('heading_open');

    const tokens = lexSource(source, 'obsidian');

    expect(
      tokens
        .filter((token) => token.kind === 'block-marker')
        .map((token) => token.raw),
    ).toEqual(['#']);
  });

  test('bare carriage returns let a closing fence end before the next link', () => {
    const source = '```js\rlet x\r```\r[x](foo)';
    const parserTokens = createObsidianParser().parse(source, {});

    expect(parserTokens[0].type).toBe('fence');

    expect(parserTokens[2].children?.map((token) => token.type)).toContain(
      'link_open',
    );

    const tokens = lexSource(source, 'obsidian');

    expect(
      tokens.filter((token) => token.kind === 'code').map((token) => token.raw),
    ).toEqual(['```js\rlet x\r```\r']);

    expect(
      tokens.filter((token) => token.kind === 'link').map((token) => token.raw),
    ).toEqual(['[x](foo)']);
  });
});
