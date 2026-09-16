import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { renderTiddlyWiki } from '@/testing/support/runtime/renderTiddlyWiki';
import { imageExtensions } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/images/imageExtensions';

describe('official TiddlyWiki feature inventory', () => {
  test.each(imageExtensions)(
    'TW-EMBED-IMAGE-%s: typed transclusion uses a native Obsidian embed',
    (extension) => {
      const source = '{{assets/diagram.' + extension + '}}';

      const original = parseTiddlyWiki(source);

      expect(original.blocks[0]).toMatchObject({
        children: [
          {
            type: 'embed',
            kind: 'transclusion',
            target: 'assets/diagram.' + extension,
          },
        ],
      });

      const outgoing = convertText(source, 'tiddlywiki', 'obsidian');

      expect(outgoing.diagnostics).toEqual([]);
      expect(outgoing.text).toBe('![[assets/diagram.' + extension + ']]');

      const incoming = convertText(
        outgoing.text + '\n\nEdited nearby.',
        'obsidian',
        'tiddlywiki',
      );

      expect(incoming.text).toContain(source);
      expect(incoming.text).toContain('Edited nearby.');
    },
  );

  test('keeps explicit images distinct from typed transclusions', () => {
    const image = convertText(
      '[img[assets/diagram.png]]',
      'tiddlywiki',
      'obsidian',
    );

    const transclusion = convertText(
      '{{assets/diagram.png}}',
      'tiddlywiki',
      'obsidian',
    );

    expect(image.text).toBe('![](<assets/diagram.png>)');
    expect(transclusion.text).toBe('![[assets/diagram.png]]');

    expect(convertText(image.text, 'obsidian', 'tiddlywiki').text).toContain(
      '[img',
    );

    expect(convertText(transclusion.text, 'obsidian', 'tiddlywiki').text).toBe(
      '{{assets/diagram.png}}',
    );
  });

  test('TW-IMAGE-SEMANTICS: alt, tooltip, dimensions, quoting and literal URLs remain distinct', async () => {
    const source =
      '[img alt="Accessible description" width=125px height=50% [Mouse tooltip|https://example.org/a.svg?x=1&y=2]]';

    const original = parseTiddlyWiki(source);

    expect(original.blocks[0]).toMatchObject({
      children: [
        {
          type: 'embed',
          kind: 'image',
          alt: 'Accessible description',
          title: 'Mouse tooltip',
          width: '125px',
          height: '50%',
          target: 'https://example.org/a.svg?x=1&y=2',
        },
      ],
    });

    const markdown = convertText(source, 'tiddlywiki', 'obsidian');

    const recovered = convertText(markdown.text, 'obsidian', 'tiddlywiki');

    expect(await renderTiddlyWiki(recovered.text)).toBe(
      await renderTiddlyWiki(source),
    );
  });
});
