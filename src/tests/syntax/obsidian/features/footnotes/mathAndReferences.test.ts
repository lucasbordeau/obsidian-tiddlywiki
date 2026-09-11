import { assertStableRoundTrip } from '../../../../support/assertStableRoundTrip';
import { mathAndFootnoteSources } from './mathAndFootnoteSources';

describe('official Obsidian feature inventory', () => {
  test.each(mathAndFootnoteSources)('O-MATH-FOOTNOTE: %s', (source) => {
    assertStableRoundTrip(source);
  });
});
