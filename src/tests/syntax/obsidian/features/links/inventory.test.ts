import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { collectAllInlines } from '../../../../support/ast/collectAllInlines';
import { assertStableRoundTrip } from '../../../../support/assertStableRoundTrip';
import { linkSources } from './linkSources';

describe('official Obsidian feature inventory', () => {
  test.each(linkSources)(
    'O-LINK: %s preserves destination and label semantics',
    (source) => {
      expect(
        collectAllInlines(parseObsidian(source).blocks).some(
          (node) => node.type === 'link',
        ),
      ).toBe(true);

      assertStableRoundTrip(source);
    },
  );
});
