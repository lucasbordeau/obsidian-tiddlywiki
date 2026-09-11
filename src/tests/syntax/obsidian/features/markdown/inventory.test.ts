import { assertStableRoundTrip } from '../../../../support/assertStableRoundTrip';
import { markdownFeatureSources } from './markdownFeatureSources';

describe('official Obsidian feature inventory', () => {
  test.each(markdownFeatureSources)(
    'O-BASIC: composed formatting remains stable: %s',
    (source) => {
      assertStableRoundTrip(source);
    },
  );
});
