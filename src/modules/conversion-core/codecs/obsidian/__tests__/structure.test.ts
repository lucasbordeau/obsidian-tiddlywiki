import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';
import { invalidFrontMatterSources } from '@/modules/conversion-core/codecs/obsidian/__tests__/invalidFrontMatterSources';

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

  it.each(invalidFrontMatterSources)(
    'reports invalid front matter: %s',
    (source, code) => {
      const parsed = parseObsidianFrontMatter(source);

      expect(parsed.value).toBeUndefined();
      expect(parsed.diagnostics[0].code).toBe(code);
    },
  );

  it('emits a canonical YAML tag list even for one tag', () => {
    const source = serializeObsidianFrontMatter({ tags: ['NPC'] }, '# Body');

    expect(source).toContain('tags:\n  - NPC\n');

    expect(parseObsidianFrontMatter(source).value?.properties.tags).toEqual([
      'NPC',
    ]);
  });
});
