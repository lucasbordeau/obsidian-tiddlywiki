import { assertStableRoundTrip } from '@/tests/support/assertStableRoundTrip';
import { markdownFeatureSources } from '@/tests/syntax/obsidian/features/markdown/markdownFeatureSources';

describe('official Obsidian feature inventory', () => {
  test.each(markdownFeatureSources)(
    'O-BASIC: composed formatting remains stable: %s',
    (source) => {
      assertStableRoundTrip(source);
    },
  );
});
