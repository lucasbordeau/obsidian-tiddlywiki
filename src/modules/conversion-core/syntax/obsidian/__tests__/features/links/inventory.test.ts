import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { collectAllInlines } from '@/testing/support/ast/collectAllInlines';
import { assertStableRoundTrip } from '@/testing/support/assertStableRoundTrip';
import { linkSources } from '@/modules/conversion-core/syntax/obsidian/__tests__/features/links/linkSources';

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
