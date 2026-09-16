import { assertStableRoundTrip } from '@/testing/support/assertStableRoundTrip';
import { mathAndFootnoteSources } from '@/modules/conversion-core/syntax/obsidian/__tests__/features/footnotes/mathAndFootnoteSources';

describe('official Obsidian feature inventory', () => {
  test.each(mathAndFootnoteSources)('O-MATH-FOOTNOTE: %s', (source) => {
    assertStableRoundTrip(source);
  });
});
