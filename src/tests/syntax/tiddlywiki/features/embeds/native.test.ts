import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { renderTiddlyWiki } from '@/tests/support/runtime/renderTiddlyWiki';
import { normalizeSemanticBlocks } from '@/tests/support/ast/normalizeSemanticBlocks';
import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { nativeCases } from '@/tests/syntax/tiddlywiki/features/embeds/nativeCases';

describe('official TiddlyWiki feature inventory', () => {
  test.each(nativeCases)(
    '$id: native source is structural and agrees with the TW renderer',
    async ({ source }) => {
      const original = parseTiddlyWiki(source);

      expect(original.diagnostics).toEqual([]);

      const outgoing = serializeTiddlyWiki(original);

      expect(outgoing.text).not.toContain('<!--otw:');

      expect(
        normalizeSemanticBlocks(parseTiddlyWiki(outgoing.text).blocks),
      ).toEqual(normalizeSemanticBlocks(original.blocks));

      expect(await renderTiddlyWiki(outgoing.text)).toBe(
        await renderTiddlyWiki(source),
      );
    },
  );

  test.each([
    {
      id: 'TW-NOTE-EMBED-TEXT',
      source: '{{A complete note!!text}}',
    },
    {
      id: 'TW-TRANSCLUDE-WIDGET',
      source: '<$transclude $tiddler="A complete note"/>',
    },
    {
      id: 'TW-TRANSCLUDE-WIDGET-LEGACY',
      source: '<$transclude tiddler="A complete note" field="text"/>',
    },
  ])('$id maps to the same native Obsidian transclusion', ({ source }) => {
    const converted = convertText(source, 'tiddlywiki', 'obsidian');

    expect(converted.text).toBe('![[A complete note]]');
    expect(converted.diagnostics).toEqual([]);
  });

  test('accepts punctuation that is valid in an Obsidian note title', () => {
    const converted = convertText(
      '{{Important! note}}',
      'tiddlywiki',
      'obsidian',
    );

    expect(converted.text).toBe('![[Important! note]]');
    expect(converted.diagnostics).toEqual([]);
  });
});
