import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { readMarkdownSample as fixture } from '@/testing/support/samples/readMarkdownSample';
import { stripSourceRanges as semanticBlocks } from '@/testing/support/ast/stripSourceRanges';
import { compoundMarkdownSources } from '@/modules/conversion-core/syntax/obsidian/serialization/__tests__/compoundMarkdownSources';

describe('Obsidian semantic serialization', () => {
  test.each(compoundMarkdownSources)(
    'maintains shared AST through canonical parse/emit cycles: %s',
    (source) => {
      const first = parseObsidian(source);

      const emitted = serializeObsidian(first);

      const second = parseObsidian(emitted.text);

      expect(semanticBlocks(second.blocks)).toEqual(
        semanticBlocks(first.blocks),
      );

      expect(serializeObsidian(second).text).toBe(emitted.text);
    },
  );

  test('complex corpus preserves structure after canonical serialization', () => {
    const document = parseObsidian(fixture('adversarial-nesting.md'));

    expect(document.blocks).toHaveLength(6);

    const emitted = serializeObsidian(document);

    expect(semanticBlocks(parseObsidian(emitted.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );
  });
});
