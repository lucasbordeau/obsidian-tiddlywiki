import fc from 'fast-check';
import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';
import { createTiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/createTiddlyWikiParsingContext';
import { Dialect } from '@/modules/conversion-core/model/Dialect';

const requestedSeed = Number(process.env.LEXER_FUZZ_SEED);
const fuzzSeed = Number.isInteger(requestedSeed) ? requestedSeed : 0x5eed;
const requestedRuns = Number(process.env.LEXER_FUZZ_RUNS);

const fuzzRuns =
  Number.isInteger(requestedRuns) && requestedRuns > 0 ? requestedRuns : 150;

const fuzzParameters = { seed: fuzzSeed, numRuns: fuzzRuns };

const lineEndingArbitrary = fc.constantFrom('\n', '\r', '\r\n');

const sourceFragmentArbitrary = fc.constantFrom(
  'text',
  '[[Note]]',
  '![alt](photo.png)',
  '[x](path.md)',
  '`literal`',
  '```',
  '<<macro "a >> b">>',
  '{{Note}}',
  '<!-- comment -->',
  '%% hidden %%',
  '/% hidden %/',
  '\\',
  '\n',
  '\r',
  '\r\n',
  '🙂é',
);

const markdownLabelArbitrary = fc.oneof(
  fc
    .array(fc.constantFrom('a', 'Z', '0', 'é', '🙂', '_'), {
      minLength: 1,
      maxLength: 6,
    })
    .map((characters) => characters.join('')),
  fc.constantFrom('a `]` b', 'a ``]`` b', 'a [nested] b'),
);

const markdownDestinationArbitrary = fc.constantFrom(
  'plain.md',
  "john's.md",
  'path"quote.md',
  '<a)b.md>',
  '<a(b).md>',
  "https://example.org/o'brien",
);

const tiddlyWikiTargetArbitrary = fc
  .array(fc.constantFrom('a', 'b', '/', '\\', 'é', '🙂'), {
    minLength: 1,
    maxLength: 6,
  })
  .map((characters) => characters.join(''));

describe('generated lexer boundaries', () => {
  test.each<Dialect>(['obsidian', 'tiddlywiki'])(
    '%s partitions short mixed syntax without losing source',
    (dialect) => {
      const mixedSourceArbitrary = fc
        .array(sourceFragmentArbitrary, { maxLength: 12 })
        .map((fragments) => fragments.join(''));

      fc.assert(
        fc.property(mixedSourceArbitrary, (source) => {
          const tokens = lexSource(source, dialect);
          let expectedStart = 0;

          for (const token of tokens) {
            expect(token.range.start).toBe(expectedStart);
            expect(token.range.end).toBeGreaterThan(token.range.start);

            expect(token.raw).toBe(
              source.slice(token.range.start, token.range.end),
            );

            expectedStart = token.range.end;
          }

          expect(expectedStart).toBe(source.length);
        }),
        fuzzParameters,
      );
    },
  );

  test('keeps valid Markdown destinations intact amid surrounding syntax', () => {
    const markdownReferenceArbitrary = fc.record({
      label: markdownLabelArbitrary,
      destination: markdownDestinationArbitrary,
      prefix: fc.constantFrom('', 'plain ', '\n', '%% hidden %%\n'),
      suffix: fc.constantFrom('', ' [[after]]', '\r\n'),
    });

    fc.assert(
      fc.property(
        markdownReferenceArbitrary,
        ({ label, destination, prefix, suffix }) => {
          const reference = `[${label}](${destination})`;
          const source = `${prefix}${reference}${suffix}`;
          const parserTokens = createObsidianParser().parse(reference, {});

          const parserRecognizesLink = parserTokens.some((token) =>
            token.children?.some((child) => child.type === 'link_open'),
          );

          expect(parserRecognizesLink).toBe(true);

          const tokens = lexSource(source, 'obsidian');
          const expectedEnd = prefix.length + reference.length;

          const matchingLink = tokens.find(
            (token) =>
              token.kind === 'link' && token.range.start === prefix.length,
          );

          expect(matchingLink).toMatchObject({
            raw: reference,
            range: { start: prefix.length, end: expectedEnd },
          });
        },
      ),
      fuzzParameters,
    );
  });

  test('keeps generated backslash escapes and following links separate', () => {
    const escapedSourceArbitrary = fc.record({
      escapedCharacter: fc.constantFrom(
        '*',
        '[',
        ']',
        '\\',
        'a',
        '0',
        'é',
        '🙂',
      ),
      separator: lineEndingArbitrary,
    });

    const escapableCharacters = new Set(['*', '[', ']', '\\']);

    fc.assert(
      fc.property(escapedSourceArbitrary, ({ escapedCharacter, separator }) => {
        const escapedSource = `\\${escapedCharacter}`;
        const source = `${escapedSource}${separator}[[outside]]`;
        const tokens = lexSource(source, 'obsidian');

        const expectedEscapes = escapableCharacters.has(escapedCharacter)
          ? [escapedSource]
          : [];

        expect(
          tokens
            .filter((token) => token.kind === 'escape')
            .map((token) => token.raw),
        ).toEqual(expectedEscapes);

        expect(tokens.filter((token) => token.kind === 'link')).toEqual([
          {
            kind: 'link',
            range: {
              start: escapedSource.length + separator.length,
              end: source.length,
            },
            raw: '[[outside]]',
          },
        ]);
      }),
      fuzzParameters,
    );
  });

  test('shields links inside generated Markdown fences', () => {
    const fencedSourceArbitrary = fc.record({
      marker: fc.constantFrom('```', '````', '~~~', '~~~~'),
      lineEnding: lineEndingArbitrary,
      interiorLine: fc.constantFrom(
        '[[inside]]',
        '> ```',
        '    ```',
        '<<macro [[a >> b]]>>',
        '**[[inside]]**',
      ),
    });

    fc.assert(
      fc.property(
        fencedSourceArbitrary,
        ({ marker, lineEnding, interiorLine }) => {
          const codeSource = [
            marker,
            interiorLine,
            '[[inside]]',
            marker,
            '',
          ].join(lineEnding);

          const source = `${codeSource}[[outside]]`;
          const parserTokens = createObsidianParser().parse(source, {});

          expect(parserTokens[0].type).toBe('fence');

          const tokens = lexSource(source, 'obsidian');
          const codeTokens = tokens.filter((token) => token.kind === 'code');
          const linkTokens = tokens.filter((token) => token.kind === 'link');

          expect(codeTokens).toEqual([
            {
              kind: 'code',
              range: { start: 0, end: codeSource.length },
              raw: codeSource,
            },
          ]);

          expect(linkTokens).toEqual([
            {
              kind: 'link',
              range: { start: codeSource.length, end: source.length },
              raw: '[[outside]]',
            },
          ]);
        },
      ),
      fuzzParameters,
    );
  });

  test('does not pair fenced backticks with later Markdown label code spans', () => {
    const fenceAndLabelArbitrary = fc.record({
      fence: fc.constantFrom(
        { opening: '~~~', closing: '~~~' },
        { opening: '```', closing: '````' },
        { opening: '````', closing: '````' },
      ),
      lineEnding: lineEndingArbitrary,
      codeRun: fc.constantFrom('`', '``'),
    });

    fc.assert(
      fc.property(fenceAndLabelArbitrary, ({ fence, lineEnding, codeRun }) => {
        const fencedSource = [fence.opening, codeRun, fence.closing, ''].join(
          lineEnding,
        );

        const reference = `[a ${codeRun}]${codeRun} b](foo)`;
        const source = fencedSource + reference;
        const parserTokens = createObsidianParser().parse(source, {});

        const parserRecognizesLink = parserTokens.some((token) =>
          token.children?.some((child) => child.type === 'link_open'),
        );

        expect(parserRecognizesLink).toBe(true);

        const tokens = lexSource(source, 'obsidian');

        expect(tokens.filter((token) => token.kind === 'link')).toEqual([
          {
            kind: 'link',
            range: { start: fencedSource.length, end: source.length },
            raw: reference,
          },
        ]);
      }),
      fuzzParameters,
    );
  });

  test('shields links inside dialect comments', () => {
    const commentSyntaxArbitrary = fc.constantFrom(
      { dialect: 'obsidian' as const, opening: '%%', closing: '%%' },
      { dialect: 'tiddlywiki' as const, opening: '/%', closing: '%/' },
      { dialect: 'obsidian' as const, opening: '<!--', closing: '-->' },
      { dialect: 'tiddlywiki' as const, opening: '<!--', closing: '-->' },
    );

    const commentPayloadArbitrary = fc
      .array(
        fc.constantFrom('[[inside]]', '**bold**', '{{Note}}', '🙂', '\r\n'),
        {
          minLength: 1,
          maxLength: 5,
        },
      )
      .map((fragments) => fragments.join(''));

    fc.assert(
      fc.property(
        commentSyntaxArbitrary,
        commentPayloadArbitrary,
        ({ dialect, opening, closing }, payload) => {
          const comment = `${opening}${payload}${closing}`;
          const source = `${comment} [[outside]]`;
          const tokens = lexSource(source, dialect);

          expect(tokens[0]).toEqual({
            kind: 'comment',
            range: { start: 0, end: comment.length },
            raw: comment,
          });

          expect(tokens.filter((token) => token.kind === 'link')).toEqual([
            {
              kind: 'link',
              range: { start: comment.length + 1, end: source.length },
              raw: '[[outside]]',
            },
          ]);
        },
      ),
      fuzzParameters,
    );
  });

  test('keeps generated quoted HTML attributes inside their tag', () => {
    const attributeArbitrary = fc
      .array(fc.constantFrom('[[inside]]', ' > ', '🙂', '<<macro>>'), {
        minLength: 1,
        maxLength: 5,
      })
      .map((fragments) => fragments.join(''));

    const tagArbitrary = fc.constantFrom(
      { dialect: 'obsidian' as const, name: 'em', kind: 'html' },
      { dialect: 'tiddlywiki' as const, name: '$text', kind: 'widget' },
    );

    fc.assert(
      fc.property(
        tagArbitrary,
        attributeArbitrary,
        ({ dialect, name, kind }, attribute) => {
          const tag = `<${name} title="${attribute}"/>`;
          const source = `${tag} [[outside]]`;
          const tokens = lexSource(source, dialect);

          expect(tokens[0]).toEqual({
            kind,
            range: { start: 0, end: tag.length },
            raw: tag,
          });

          expect(tokens.filter((token) => token.kind === 'link')).toEqual([
            {
              kind: 'link',
              range: { start: tag.length + 1, end: source.length },
              raw: '[[outside]]',
            },
          ]);
        },
      ),
      fuzzParameters,
    );
  });

  test('keeps generated TiddlyWiki macro attributes inside widgets', () => {
    const bracketedParameterArbitrary = fc
      .array(fc.constantFrom('a', ' >> ', '🙂', '<name>'), {
        minLength: 1,
        maxLength: 4,
      })
      .map((fragments) => fragments.join(''));

    fc.assert(
      fc.property(bracketedParameterArbitrary, (parameter) => {
        const widget = `<$text text=<<foo [[${parameter}]]>>/>`;
        const source = `${widget} [[outside]]`;
        const tokens = lexSource(source, 'tiddlywiki');

        expect(tokens[0]).toEqual({
          kind: 'widget',
          range: { start: 0, end: widget.length },
          raw: widget,
        });

        expect(tokens.filter((token) => token.kind === 'link')).toEqual([
          {
            kind: 'link',
            range: { start: widget.length + 1, end: source.length },
            raw: '[[outside]]',
          },
        ]);
      }),
      fuzzParameters,
    );
  });

  test('keeps generated angle autolinks separate from following wiki links', () => {
    const autolinkArbitrary = fc.record({
      scheme: fc.constantFrom('http', 'https'),
      host: fc.constantFrom('example.org', 'docs.test', 'a.io'),
      path: fc.constantFrom('', '/a', '/a(b)', '/?q=1&b=2'),
    });

    fc.assert(
      fc.property(autolinkArbitrary, ({ scheme, host, path }) => {
        const autolink = `<${scheme}://${host}${path}>`;
        const source = `${autolink} [[outside]]`;
        const parserTokens = createObsidianParser().parse(source, {});

        const parserHasAutolink = parserTokens.some((token) =>
          token.children?.some((child) => child.type === 'link_open'),
        );

        expect(parserHasAutolink).toBe(true);

        const tokens = lexSource(source, 'obsidian');

        expect(tokens.filter((token) => token.kind === 'link')).toEqual([
          {
            kind: 'link',
            range: { start: 0, end: autolink.length },
            raw: autolink,
          },
          {
            kind: 'link',
            range: { start: autolink.length + 1, end: source.length },
            raw: '[[outside]]',
          },
        ]);
      }),
      fuzzParameters,
    );
  });

  test('recovers a Markdown link after generated unfinished HTML attributes', () => {
    const unfinishedTagArbitrary = fc.record({
      tagName: fc.constantFrom('a', 'div', 'widget'),
      attributeName: fc.constantFrom('title', 'data-note'),
      lineEnding: lineEndingArbitrary,
    });

    fc.assert(
      fc.property(
        unfinishedTagArbitrary,
        ({ tagName, attributeName, lineEnding }) => {
          const unfinishedTag = `<${tagName} ${attributeName}="[[inside]]`;
          const source = `${unfinishedTag}${lineEnding}[x](foo)`;
          const tokens = lexSource(source, 'obsidian');

          expect(tokens.filter((token) => token.kind === 'html')).toEqual([]);

          expect(tokens[tokens.length - 1]).toEqual({
            kind: 'link',
            range: {
              start: unfinishedTag.length + lineEnding.length,
              end: source.length,
            },
            raw: '[x](foo)',
          });
        },
      ),
      fuzzParameters,
    );
  });

  test('keeps the first line of a TiddlyWiki fence inside code', () => {
    const tiddlyWikiFenceArbitrary = fc.record({
      opener: fc.constantFrom('```', '```text'),
      lineEnding: fc.constantFrom('\n', '\r\n'),
      firstBodyLine: fc.constantFrom('```', '[[inside]]', '> ```'),
    });

    fc.assert(
      fc.property(
        tiddlyWikiFenceArbitrary,
        ({ opener, lineEnding, firstBodyLine }) => {
          const codeSource = [
            opener,
            firstBodyLine,
            '[[inside]]',
            '```',
            '',
          ].join(lineEnding);

          const source = `${codeSource}[[outside]]`;
          const parsingContext = createTiddlyWikiParsingContext(source);

          const blocks = parsingContext.parseBlocks(
            0,
            parsingContext.lines.length,
          );

          expect(blocks[0].type).toBe('code');

          expect(blocks[1]).toMatchObject({
            type: 'paragraph',
            children: [
              expect.objectContaining({ type: 'link', target: 'outside' }),
            ],
          });

          const tokens = lexSource(source, 'tiddlywiki');
          const codeTokens = tokens.filter((token) => token.kind === 'code');
          const linkTokens = tokens.filter((token) => token.kind === 'link');

          expect(codeTokens).toEqual([
            {
              kind: 'code',
              range: { start: 0, end: codeSource.length },
              raw: codeSource,
            },
          ]);

          expect(linkTokens).toEqual([
            {
              kind: 'link',
              range: { start: codeSource.length, end: source.length },
              raw: '[[outside]]',
            },
          ]);
        },
      ),
      fuzzParameters,
    );
  });

  test('keeps adjacent TiddlyWiki links separate around backslashes', () => {
    fc.assert(
      fc.property(tiddlyWikiTargetArbitrary, (target) => {
        const firstReference = `[[${target}]]`;
        const source = `${firstReference} [[outside]]`;
        const tokens = lexSource(source, 'tiddlywiki');

        expect(tokens.filter((token) => token.kind === 'link')).toEqual([
          {
            kind: 'link',
            range: { start: 0, end: firstReference.length },
            raw: firstReference,
          },
          {
            kind: 'link',
            range: { start: firstReference.length + 1, end: source.length },
            raw: '[[outside]]',
          },
        ]);
      }),
      fuzzParameters,
    );
  });

  test('protects generated bracketed and quoted TiddlyWiki macro parameters', () => {
    const macroParameterArbitrary = fc
      .array(fc.constantFrom('a', ' >> ', '🙂', ' > ', '\\'), {
        minLength: 1,
        maxLength: 5,
      })
      .map((fragments) => fragments.join(''));

    fc.assert(
      fc.property(macroParameterArbitrary, (parameter) => {
        const macro = `<<m [[${parameter}]] "literal >> quote">>`;
        const source = `${macro} [[outside]]`;
        const parsingContext = createTiddlyWikiParsingContext(source);

        const blocks = parsingContext.parseBlocks(
          0,
          parsingContext.lines.length,
        );

        expect(blocks[0]).toEqual(
          expect.objectContaining({
            type: 'paragraph',
            children: expect.arrayContaining([
              expect.objectContaining({ type: 'raw', value: macro }),
            ]),
          }),
        );

        const tokens = lexSource(source, 'tiddlywiki');

        expect(tokens.filter((token) => token.kind === 'macro')).toEqual([
          { kind: 'macro', range: { start: 0, end: macro.length }, raw: macro },
        ]);

        expect(tokens.filter((token) => token.kind === 'link')).toEqual([
          {
            kind: 'link',
            range: { start: macro.length + 1, end: source.length },
            raw: '[[outside]]',
          },
        ]);
      }),
      fuzzParameters,
    );
  });

  test('recovers a later link after generated unfinished openers', () => {
    const unfinishedSourceArbitrary = fc.record({
      lineEnding: lineEndingArbitrary,
      opener: fc.constantFrom(
        { dialect: 'obsidian' as const, source: '[[unfinished' },
        { dialect: 'tiddlywiki' as const, source: '<<unfinished' },
      ),
    });

    fc.assert(
      fc.property(unfinishedSourceArbitrary, ({ lineEnding, opener }) => {
        const source = `${opener.source}${lineEnding}[[outside]]`;
        const tokens = lexSource(source, opener.dialect);

        expect(tokens.filter((token) => token.kind === 'link')).toEqual([
          {
            kind: 'link',
            range: {
              start: opener.source.length + lineEnding.length,
              end: source.length,
            },
            raw: '[[outside]]',
          },
        ]);
      }),
      fuzzParameters,
    );
  });
});
