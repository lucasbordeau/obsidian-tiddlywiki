import { convertText } from '../../../../../modules/conversion-core/conversion/convertText';
import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { allInlines } from '../../../../support/ast/traversal/allInlines';
import { stableRoundTrip } from '../../../../support/conversion/stableRoundTrip';
import { preservedHtmlSources } from './cases/preservedHtmlSources';

describe('official Obsidian feature inventory', () => {
  test.each(preservedHtmlSources)(
    'O-PRESERVED: %s survives a neighboring edit with diagnostics',
    (_description, source) => {
      const outgoing = convertText(
        `${source}\n\n## Neighbor`,
        'obsidian',
        'tiddlywiki',
      );

      expect(outgoing.diagnostics.length).toBeGreaterThan(0);

      const incoming = convertText(
        outgoing.text.replace('Neighbor', 'Edited neighbor'),
        'tiddlywiki',
        'obsidian',
      );

      expect(incoming.text).toContain('Edited neighbor');

      const expectedRaw = allInlines(parseObsidian(source).blocks).filter(
        (node) => node.type === 'raw',
      );

      for (const raw of expectedRaw) {
        if (raw.type === 'raw') {
          expect(incoming.text).toContain(raw.value);
        }
      }

      stableRoundTrip(source);
    },
  );
});
