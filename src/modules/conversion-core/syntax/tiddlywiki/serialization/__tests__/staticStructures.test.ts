import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { normalizeSemanticBlocks } from '@/testing/support/ast/normalizeSemanticBlocks';
import { renderTiddlyWiki } from '@/testing/support/runtime/renderTiddlyWiki';

describe('TiddlyWiki structural parsing and serialization', () => {
  test('complex continuation/task/start-number lists survive the static HTML representation', async () => {
    const source =
      '7. **first**\n\n   continuation with [URL](https://example.org/?a=1&b=2)\n\n   - [x] checked\n   - [ ] unchecked\n\n8. second';

    const original = parseObsidian(source);

    const serialized = serializeTiddlyWiki(original);

    expect(serialized.text).toContain('<ol start="7">');
    expect(serialized.text).not.toContain('<!--otw');

    expect(
      normalizeSemanticBlocks(parseTiddlyWiki(serialized.text).blocks),
    ).toEqual(normalizeSemanticBlocks(original.blocks));

    const html = await renderTiddlyWiki(serialized.text);

    expect(html).toContain('<ol start="7">');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked');
    expect(html).toContain('href="https://example.org/?a=1&amp;b=2"');
  });

  test('callouts and footnotes use visible static structures and recover their semantic nodes', async () => {
    const source =
      '> [!warning]- **Rich** _title_\n> Body with ==highlight==.\n\nFootnote[^é id].\n\n[^é id]: Definition **body**.';

    const original = parseObsidian(source);

    const serialized = serializeTiddlyWiki(original);

    expect(serialized.text).toContain('<aside');
    expect(serialized.text).toContain('<mark>');

    expect(
      normalizeSemanticBlocks(parseTiddlyWiki(serialized.text).blocks),
    ).toEqual(normalizeSemanticBlocks(original.blocks));

    const html = await renderTiddlyWiki(serialized.text);

    expect(html).toContain('<aside');
    expect(html).toContain('<mark>highlight</mark>');
  });
});
