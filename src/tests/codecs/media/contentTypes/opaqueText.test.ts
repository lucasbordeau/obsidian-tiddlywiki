import { exportObsidianNote } from '../../../../modules/conversion-core/notes/export/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/import/importTiddler';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/parsing/parseObsidianFrontMatter';
import { valueOf } from '../../../support/codecs/valueOf';
import { textualCases } from './cases/textualCases';

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
        valueOf(parseObsidianFrontMatter(valueOf(imported).content)).body,
      ).toBe(text);

      expect(valueOf(exportObsidianNote(valueOf(imported)))).toEqual(original);
    },
  );
});
