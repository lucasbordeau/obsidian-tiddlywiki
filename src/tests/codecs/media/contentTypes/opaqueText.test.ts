import { exportObsidianNote } from '../../../../modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/importTiddler';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { getCodecValue } from '../../../support/getCodecValue';
import { textualCases } from './textualCases';

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

      expect(
        getCodecValue(parseObsidianFrontMatter(getCodecValue(imported).content))
          .body,
      ).toBe(text);

      expect(
        getCodecValue(exportObsidianNote(getCodecValue(imported))),
      ).toEqual(original);
    },
  );
});
