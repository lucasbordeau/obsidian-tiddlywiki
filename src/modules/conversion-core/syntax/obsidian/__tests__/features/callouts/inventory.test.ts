import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { assertStableRoundTrip } from '@/testing/support/assertStableRoundTrip';
import { calloutTypes } from '@/modules/conversion-core/syntax/obsidian/__tests__/features/callouts/calloutTypes';

describe('official Obsidian feature inventory', () => {
  test.each(calloutTypes)(
    'O-CALLOUT: %s retains type, folding, rich title, media and nested content',
    (type) => {
      const source = `> [!${type}]- **Title** [[Note|alias]]\n> Text ![[assets/a.png|120]] and $x_1$.\n>\n> > [!tip]+ Nested\n> > - [x] finished\n> > - [ ] waiting`;

      expect(parseObsidian(source).blocks[0]).toMatchObject({
        type: 'quote',
        callout: { type, fold: '-', title: 'Title alias' },
      });

      assertStableRoundTrip(source);
    },
  );
});
