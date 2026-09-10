import { stableRoundTrip } from '../../../../support/conversion/stableRoundTrip';
import { markdownFeatureSources } from './cases/markdownFeatureSources';

describe('official Obsidian feature inventory', () => {
  test.each(markdownFeatureSources)(
    'O-BASIC: composed formatting remains stable: %s',
    (source) => {
      stableRoundTrip(source);
    },
  );
});
