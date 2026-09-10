import { stableRoundTrip } from '../../../../support/conversion/stableRoundTrip';
import { mathAndFootnoteSources } from './cases/mathAndFootnoteSources';

describe('official Obsidian feature inventory', () => {
  test.each(mathAndFootnoteSources)('O-MATH-FOOTNOTE: %s', (source) => {
    stableRoundTrip(source);
  });
});
