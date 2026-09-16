import { assertStableRoundTrip } from '@/testing/support/assertStableRoundTrip';
import { markdownFeatureSources } from '@/modules/conversion-core/syntax/obsidian/__tests__/features/markdown/markdownFeatureSources';

describe('official Obsidian feature inventory', () => {
  test.each(markdownFeatureSources)(
    'O-BASIC: composed formatting remains stable: %s',
    (source) => {
      assertStableRoundTrip(source);
    },
  );
});
