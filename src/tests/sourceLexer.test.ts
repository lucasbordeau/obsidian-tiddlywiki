import { lexSource } from '../modules/conversion-core/lexer/lexSource';
import { decodePreservedSource } from '../modules/conversion-core/preservation/decodePreservedSource';
import { encodePreservedSource } from '../modules/conversion-core/preservation/encodePreservedSource';
import { Dialect } from '../modules/conversion-core/types/Dialect';

describe('concrete source tokens', () => {
  test.each([
    '[img alt="[[literal]]" tooltip=\'A > B\'[caption|photo.svg]]',
    '[img width={{{ [<width>multiply[2]] }}} class=<<classes "inside >> quote">> [photo.svg]]',
    '[img tooltip="""[[literal]] and "quotes" here""" width=`${width}$px` [photo.svg]]',
    '[img alt="C:\\media\\" [photo.svg]]',
    '[img tooltip=```single ` and [[literal]]``` [photo.svg]]',
  ])(
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

  const dialects: Dialect[] = ['obsidian', 'tiddlywiki'];
  const adversarialSources = [
    '',
    'é🙂\r\n!NoSpace\n\n** nested [[label|Folder/A]] and `**literal**`\n',
    '*** __ == ~~ \\[[escape]] & <u>__literal__</u> ![[diagram.svg|80x40]]',
    '<!-- [[ignored]] -->\n%% **ignored** %%\n<<macro "[[argument]]">>\n{{{ [tag[A]] }}}',
    '[display [nested]](https://example.org/a_(b)?q=%23 "title")\n[img width="80"[alt|photo.svg]]',
    '<$list filter="[tag[x]]"><$text text="a > b"/></$list>\n[[unclosed\n\r\n🙂',
    '\\rules only filteredtranscludeinline\n{{{ [all[]] }}}\n```',
    '[img tooltip="""[[literal]] and "quotes"""" width=`${width}$px` [photo.svg]]',
  ];
  for (const dialect of dialects) {
    test.each(adversarialSources)(
      `${dialect}: exact UTF-16 source reconstruction %j`,
      (source) => {
        const tokens = lexSource(source, dialect);
        expect(tokens.map((token) => token.raw).join('')).toBe(source);
        let previousEnd = 0;
        for (const token of tokens) {
          expect(token.range.start).toBe(previousEnd);
          expect(token.range.end).toBeGreaterThan(token.range.start);
          expect(token.raw).toBe(
            source.slice(token.range.start, token.range.end),
          );
          previousEnd = token.range.end;
        }
        expect(previousEnd).toBe(source.length);
      },
    );
  }

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

  test('large unfinished delimiter inputs terminate without losing text', () => {
    const source = '[ broken ( ** __ \\ \r\n'.repeat(1000) + '🙂';
    expect(
      lexSource(source, 'obsidian')
        .map((token) => token.raw)
        .join(''),
    ).toBe(source);
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

describe('inert preservation capsules', () => {
  test('round trips Unicode, comment terminators, quotes and nested capsule-like input', () => {
    const source = {
      dialect: 'tiddlywiki' as const,
      value:
        '<$text text="🙂 --> -- <script>"/>\n<!--otw:v1:not-a-record-->\ud800',
      reason: 'Unsupported dynamic widget',
    };
    const encoded = encodePreservedSource(source);
    expect(decodePreservedSource(encoded)).toEqual(source);
    expect(encoded.slice(4, -3)).not.toContain('--');
    expect(encoded).not.toContain('<script>');
  });

  test.each([
    '<!--otw:v2:%7B%7D-->',
    '<!--otw:v1:%xx-->',
    '<!--otw:v1:null-->',
    '<!--otw:v1:%7B%22dialect%22%3A%22alien%22%7D-->',
    '<!--otw:v1:%5B%5D-->',
  ])(
    'malformed and unknown-version capsules stay ordinary source: %s',
    (source) => {
      expect(decodePreservedSource(source)).toBeUndefined();
    },
  );
});
