import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { webEmbedSources } from '@/tests/syntax/obsidian/features/embeds/webEmbedSources';
import { ordinaryImageUrls } from '@/tests/syntax/obsidian/features/embeds/ordinaryImageUrls';

describe('Obsidian documented extensions and structural regressions', () => {
  test.each(webEmbedSources)(
    'preserves provider web embeds as exact source with a diagnostic: %s',
    (source) => {
      const document = parseObsidian(source);

      expect(document.blocks).toMatchObject([
        {
          type: 'paragraph',
          children: [
            { type: 'raw', value: source, reason: 'Obsidian web embed' },
          ],
        },
      ]);

      expect(document.diagnostics).toEqual([
        expect.objectContaining({ code: 'PRESERVED_WEB_EMBED' }),
      ]);

      const converted = convertText(
        `Before ${source} after`,
        'obsidian',
        'tiddlywiki',
      );

      const restored = convertText(converted.text, 'tiddlywiki', 'obsidian');

      expect(restored.text).toContain(source);
    },
  );

  test.each(ordinaryImageUrls)(
    'keeps ordinary image endpoints as images: %s',
    (target) => {
      const document = parseObsidian(`![alt](${target})`);

      expect(document.blocks).toMatchObject([
        { children: [{ type: 'embed', kind: 'image', target, alt: 'alt' }] },
      ]);

      expect(document.diagnostics).toEqual([]);
    },
  );

  test('retains iframe HTML unchanged with an explicit embed diagnostic', () => {
    const source =
      '<iframe src="https://example.org/embed" width="560" allowfullscreen></iframe>';

    const document = parseObsidian(source);

    expect(document.diagnostics).toEqual([
      expect.objectContaining({ code: 'PRESERVED_IFRAME_EMBED' }),
    ]);

    const converted = convertText(source, 'obsidian', 'tiddlywiki');

    expect(convertText(converted.text, 'tiddlywiki', 'obsidian').text).toBe(
      source,
    );
  });

  test('converts a canonical YouTube embed to a playable TiddlyWiki iframe', () => {
    const source = '![](https://www.youtube.com/watch?v=KtCUr83XgyE)';

    const converted = convertText(source, 'obsidian', 'tiddlywiki');

    expect(converted.text).toBe(
      '<iframe src="https://www.youtube.com/embed/KtCUr83XgyE" width="560" height="315" allowfullscreen></iframe>',
    );
  });

  test('converts a canonical TiddlyWiki YouTube iframe to an Obsidian embed', () => {
    const source =
      '<iframe src="https://www.youtube.com/embed/KtCUr83XgyE" width="560" height="315" allowfullscreen></iframe>';

    const converted = convertText(source, 'tiddlywiki', 'obsidian');

    expect(converted.text).toBe(
      '![](https://www.youtube.com/watch?v=KtCUr83XgyE)',
    );
  });
});
