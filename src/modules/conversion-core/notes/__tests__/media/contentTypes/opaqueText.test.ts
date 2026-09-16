import { exportObsidianNote } from '@/modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '@/modules/conversion-core/notes/importTiddler';
import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { extractPreservationComment } from '@/modules/conversion-core/preservation/metadata/extractPreservationComment';
import { getCodecValue } from '@/testing/support/getCodecValue';
import { textualCases } from '@/modules/conversion-core/notes/__tests__/media/contentTypes/textualCases';

describe('textual and extension content types', () => {
  it.each(textualCases)(
    'preserves opaque $type exactly with a visible diagnostic',
    ({ type, text }) => {
      const original = { title: `Typed/${type}`, type, text };

      const imported = importTiddler(original);

      expect(
        imported.diagnostics.some(
          (diagnostic) => diagnostic.code === 'preserved-content-type',
        ),
      ).toBe(true);

      const document = getCodecValue(
        parseObsidianFrontMatter(getCodecValue(imported).content),
      );

      expect(extractPreservationComment(document.body).body).toBe(text);

      expect(
        getCodecValue(exportObsidianNote(getCodecValue(imported))),
      ).toEqual(original);
    },
  );
});
