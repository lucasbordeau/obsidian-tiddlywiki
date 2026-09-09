import { parseTidFile } from '../modules/conversion-core/codecs/parseTidFile';
import { serializeTidFile } from '../modules/conversion-core/codecs/serializeTidFile';
import { parseTiddlyWikiJson } from '../modules/conversion-core/codecs/parseTiddlyWikiJson';
import { serializeTiddlyWikiJson } from '../modules/conversion-core/codecs/serializeTiddlyWikiJson';
import { parseObsidianFrontMatter } from '../modules/conversion-core/codecs/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '../modules/conversion-core/codecs/serializeObsidianFrontMatter';
import { parseTiddlyWikiTags } from '../modules/conversion-core/codecs/parseTiddlyWikiTags';
import { normalizeObsidianTags } from '../modules/conversion-core/codecs/normalizeObsidianTags';
import { formatTiddlyWikiTimestamp } from '../modules/conversion-core/codecs/formatTiddlyWikiTimestamp';
import { CodecResult } from '../modules/conversion-core/codecs/CodecResult';

function valueOf<Value>(result: CodecResult<Value>): Value {
  if (result.value === undefined) {
    throw new Error(JSON.stringify(result.diagnostics));
  }
  return result.value;
}

describe('TiddlyWiki containers', () => {
  it('validates all string fields and supplies an absent optional body', () => {
    const parsed = parseTiddlyWikiJson(
      '[{"title":"A","custom":"a:b"},{"title":"B","text":"","tags":""}]',
    );
    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.value).toEqual([
      { title: 'A', custom: 'a:b', text: '' },
      { title: 'B', text: '', tags: '' },
    ]);
    expect(
      parseTiddlyWikiJson(valueOf(serializeTiddlyWikiJson(valueOf(parsed))))
        .value,
    ).toEqual(parsed.value);
  });

  it.each([
    ['{', 'invalid-json'],
    ['{"title":"A"}', 'invalid-tiddler-container'],
    ['[{"title":"A","tags":["tag"]}]', 'invalid-tiddler-field'],
    ['[{"title":"A","custom":null}]', 'invalid-tiddler-field'],
    ['[{"title":" "}]', 'missing-tiddler-title'],
    ['[{"title":"A"},{"title":"A"}]', 'duplicate-tiddler-title'],
  ])('rejects malformed input atomically: %s', (source, code) => {
    const result = parseTiddlyWikiJson(source);
    expect(result.value).toBeUndefined();
    expect(
      result.diagnostics.some((diagnostic) => diagnostic.code === code),
    ).toBe(true);
  });

  it.each(['\n', '\r\n', '\r'])(
    'preserves a .tid body with %j line endings',
    (newline) => {
      const body = `  leading text${newline}${newline}trailing${newline}`;
      const source = `title: Example${newline}custom: value: with colon${newline}${newline}${body}`;
      const parsed = parseTidFile(source);
      expect(parsed.value).toEqual({
        title: 'Example',
        custom: 'value: with colon',
        text: body,
      });
      expect(
        parseTidFile(valueOf(serializeTidFile(valueOf(parsed)))).value,
      ).toEqual(parsed.value);
    },
  );

  it('handles inline text without turning the final editor newline into body content', () => {
    expect(parseTidFile('title: Inline\r\ntext: A: B\r\n').value).toEqual({
      title: 'Inline',
      text: 'A: B',
    });
  });

  it.each([
    ['title: A\ntitle: B\n\ntext', 'duplicate-tid-field'],
    ['title A\n\ntext', 'invalid-tid-header'],
    ['title: A\ntext: inline\n\nbody', 'ambiguous-tid-text'],
  ])('reports .tid ambiguity: %s', (source, code) => {
    const parsed = parseTidFile(source);
    expect(parsed.value).toBeUndefined();
    expect(parsed.diagnostics[0].code).toBe(code);
  });

  it('rejects header values whose serialization would remove information', () => {
    expect(
      serializeTidFile({ title: 'A', text: '', custom: 'line\nbreak' }).value,
    ).toBeUndefined();
    expect(
      serializeTidFile({ title: 'A', text: '', custom: ' trailing ' }).value,
    ).toBeUndefined();
  });

  it('keeps prototype-like names as ordinary fields', () => {
    const parsed = parseTiddlyWikiJson(
      '[{"title":"A","__proto__":"original","constructor":"custom"}]',
    );
    expect(
      Object.prototype.hasOwnProperty.call(valueOf(parsed)[0], '__proto__'),
    ).toBe(true);
    expect(valueOf(parsed)[0].__proto__).toBe('original');
  });
});

describe('structural front matter and metadata values', () => {
  it('limits alias expansion before converting metadata into plain values', () => {
    const source =
      '---\na: &a [x, x, x, x, x, x, x, x, x, x]\nb: &b [*a, *a, *a, *a, *a, *a, *a, *a, *a, *a]\nc: [*b, *b, *b, *b, *b, *b, *b, *b, *b, *b]\n---\nBody';
    const result = parseObsidianFrontMatter(source);
    expect(result.value).toBeUndefined();
    expect(result.diagnostics[0].code).toBe('invalid-frontmatter');
  });
  it('preserves source, comments, CRLF, complex YAML and the exact remaining body', () => {
    const frontMatter =
      '\uFEFF---\r\n# comment\r\ntags: [NPC, "world/Été"]\r\ncreated: 2024-02-29\r\nnested:\r\n  count: 3\r\n  enabled: false\r\n---\r\n';
    const body = '\r\n# Heading\r\n';
    const parsed = parseObsidianFrontMatter(frontMatter + body);
    expect(parsed.value?.rawFrontMatter).toBe(frontMatter);
    expect(parsed.value?.body).toBe(body);
    expect(parsed.value?.properties).toEqual({
      tags: ['NPC', 'world/Été'],
      created: '2024-02-29',
      nested: { count: 3, enabled: false },
    });
  });

  it.each([
    ['---\ntags: [unclosed\n---\nBody', 'invalid-frontmatter'],
    ['---\na: 1\na: 2\n---\nBody', 'invalid-frontmatter'],
    ['---\n- not a mapping\n---\nBody', 'invalid-frontmatter-shape'],
    ['---\na: value\nBody', 'unclosed-frontmatter'],
    ['---\na: &cycle [*cycle]\n---\nBody', 'invalid-frontmatter'],
  ])('reports invalid front matter: %s', (source, code) => {
    const parsed = parseObsidianFrontMatter(source);
    expect(parsed.value).toBeUndefined();
    expect(parsed.diagnostics[0].code).toBe(code);
  });

  it('emits a canonical YAML tag list even for one tag', () => {
    const source = serializeObsidianFrontMatter({ tags: ['NPC'] }, '# Body');
    expect(source).toContain('tags:\n  - NPC\n');
    expect(parseObsidianFrontMatter(source).value?.properties.tags).toEqual([
      'NPC',
    ]);
  });

  it('normalizes tags reversibly across spaces, case, Unicode and name collisions', () => {
    const tags = parseTiddlyWikiTags(
      '[[North America]] North_America CAFÉ café world/été 123',
    );
    expect(normalizeObsidianTags(tags)).toEqual({
      North_America: 'North America',
      North_America_2: 'North_America',
      CAFÉ: 'CAFÉ',
      café_2: 'café',
      'world/été': 'world/été',
      tag_123: '123',
    });
  });

  it.each([
    ['2024-02-29', '20240229000000000'],
    ['2024-02-29T23:30:12.456+02:00', '20240229213012456'],
    ['20240229213012456', '20240229213012456'],
    ['2023-02-29', '2023-02-29'],
    ['2023-02-29T12:00:00Z', '2023-02-29T12:00:00Z'],
    ['2024-02-29T24:00:00Z', '2024-02-29T24:00:00Z'],
    ['not a date', 'not a date'],
    ['2024-02-29T12:00:00', '2024-02-29T12:00:00'],
  ])('normalizes only explicit supported dates: %s', (source, expected) => {
    expect(formatTiddlyWikiTimestamp(source)).toBe(expected);
  });
});
