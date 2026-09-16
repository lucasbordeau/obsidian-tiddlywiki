import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { renderTiddlyWiki } from '@/tests/support/runtime/renderTiddlyWiki';
import { normalizeSemanticBlocks } from '@/tests/support/ast/normalizeSemanticBlocks';
import { nativeCases } from '@/tests/syntax/tiddlywiki/features/code/nativeCases';

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
});
