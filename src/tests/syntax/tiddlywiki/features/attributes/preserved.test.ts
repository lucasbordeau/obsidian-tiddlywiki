import { convertText } from '../../../../../modules/conversion-core/conversion/convertText';
import { preservedCases } from './cases/preservedCases';

describe('official TiddlyWiki feature inventory', () => {
  test.each(preservedCases)(
    '$id: unsupported source remains inert, explicit and recoverable',
    ({ source }) => {
      const outgoing = convertText(source, 'tiddlywiki', 'obsidian');

      expect(outgoing.diagnostics.length).toBeGreaterThan(0);
      expect(outgoing.text).toContain('<!--otw:');

      const withEdit = outgoing.text + '\n\nA new paragraph added in Obsidian.';

      const incoming = convertText(withEdit, 'obsidian', 'tiddlywiki');

      expect(incoming.text).toContain(source);
      expect(incoming.text).toContain('A new paragraph added in Obsidian.');
    },
  );
});
