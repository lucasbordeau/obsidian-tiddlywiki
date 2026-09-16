import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { renderTiddlyWiki } from '@/tests/support/runtime/renderTiddlyWiki';

describe('cross-dialect conversion', () => {
  test('real TW rendering retains nested hierarchy, labels, external URLs and literal code', async () => {
    const source =
      '# Head\n\n- **outer _inner_**\n  1. ordered\n     - deep\n\n[remote](https://example.org/a_(b))\n\n```text\n**literal** [[literal]]\n```';

    const converted = convertText(source, 'obsidian', 'tiddlywiki');
    const html = await renderTiddlyWiki(converted.text);

    expect(html).toContain('<h1');
    expect(html).toContain('<strong>outer <em>inner</em></strong>');

    expect(html).toMatch(
      /<ul><li>[\s\S]*<ol><li>ordered<ul><li>deep<\/li><\/ul><\/li><\/ol>/,
    );

    expect(html).toContain('href="https://example.org/a_(b)"');
    expect(html).toContain('**literal** [[literal]]');
  });

  test('a resolver changes only internal identities and preserves labels and external image URLs', () => {
    const resolveLink = jest.fn((target: string) => `mapped/${target}`);

    const source =
      '[[Folder/A#Part|label]] ![[assets/a.svg|100]] [outside](https://example.org) ![remote](https://example.org/a.png)';

    const converted = convertText(source, 'obsidian', 'tiddlywiki', {
      resolveLink,
    });

    expect(converted.text).toContain('mapped/Folder/A#Part');
    expect(converted.text).toContain('mapped/assets/a.svg');
    expect(converted.text).toContain('label');

    expect(resolveLink.mock.calls.map((call) => call[0])).toEqual([
      'Folder/A#Part',
      'assets/a.svg',
    ]);
  });
});
