import { parseTiddlyWiki } from '../../../../../modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '../../../../../modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { renderTiddlyWiki } from '../../../../support/runtime/tiddlywiki/renderTiddlyWiki';
import { semanticBlocks } from '../../../../support/ast/comparison/semanticBlocks';
import { nativeCases } from './cases/nativeCases';

describe('official TiddlyWiki feature inventory', () => {
  test.each(nativeCases)(
    '$id: native source is structural and agrees with the TW renderer',
    async ({ source }) => {
      const original = parseTiddlyWiki(source);

      expect(original.diagnostics).toEqual([]);

      const outgoing = serializeTiddlyWiki(original);

      expect(outgoing.text).not.toContain('<!--otw:');

      expect(semanticBlocks(parseTiddlyWiki(outgoing.text).blocks)).toEqual(
        semanticBlocks(original.blocks),
      );

      expect(await renderTiddlyWiki(outgoing.text)).toBe(
        await renderTiddlyWiki(source),
      );
    },
  );
});
