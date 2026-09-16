import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { collectAllInlines } from '@/tests/support/ast/collectAllInlines';
import { assertStableRoundTrip } from '@/tests/support/assertStableRoundTrip';
import { linkSources } from '@/tests/syntax/obsidian/features/links/linkSources';

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
