import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { convertText } from '../../../../../modules/conversion-core/conversion/convertText';
import { webEmbedSources } from './cases/webEmbedSources';
import { ordinaryImageUrls } from './cases/ordinaryImageUrls';

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
});
