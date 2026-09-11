import { parseTiddlyWiki } from '../../../../modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '../../../../modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { normalizeSemanticBlocks } from '../../../support/ast/normalizeSemanticBlocks';
import { renderTiddlyWiki } from '../../../support/runtime/renderTiddlyWiki';
import { stressSource } from './stressSource';
import { collectAllNodeTypes } from '../../../support/ast/collectAllNodeTypes';
import { nativeSourceSamples } from './nativeSourceSamples';

describe('TiddlyWiki structural parsing and serialization', () => {
  test('compound fixture retains native semantics and actual TW rendering across repeated serialization', async () => {
    const original = parseTiddlyWiki(stressSource);

    expect(original.diagnostics).toEqual([]);
    expect(collectAllNodeTypes(original.blocks)).not.toContain('raw');

    let serialized = stressSource;

    for (let cycle = 0; cycle < 5; cycle++) {
      serialized = serializeTiddlyWiki(parseTiddlyWiki(serialized)).text;

      expect(
        normalizeSemanticBlocks(parseTiddlyWiki(serialized).blocks),
      ).toEqual(normalizeSemanticBlocks(original.blocks));
    }

    expect(await renderTiddlyWiki(serialized)).toBe(
      await renderTiddlyWiki(stressSource.trimEnd()),
    );
  });

  test.each(nativeSourceSamples)(
    'matches the pinned TW renderer for supported source: %s',
    async (source) => {
      const result = serializeTiddlyWiki(parseTiddlyWiki(source));

      expect(await renderTiddlyWiki(result.text)).toBe(
        await renderTiddlyWiki(source),
      );
    },
  );
});
