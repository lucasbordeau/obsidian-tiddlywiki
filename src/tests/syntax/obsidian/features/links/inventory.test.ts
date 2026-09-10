import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { allInlines } from '../../../../support/ast/traversal/allInlines';
import { stableRoundTrip } from '../../../../support/conversion/stableRoundTrip';
import { linkSources } from './cases/linkSources';

describe('official Obsidian feature inventory', () => {
  test.each(linkSources)(
    'O-LINK: %s preserves destination and label semantics',
    (source) => {
      expect(
        allInlines(parseObsidian(source).blocks).some(
          (node) => node.type === 'link',
        ),
      ).toBe(true);

      stableRoundTrip(source);
    },
  );
});
