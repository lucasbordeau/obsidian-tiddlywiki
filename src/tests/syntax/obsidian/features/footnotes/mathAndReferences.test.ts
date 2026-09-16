import { assertStableRoundTrip } from '@/tests/support/assertStableRoundTrip';
import { mathAndFootnoteSources } from '@/tests/syntax/obsidian/features/footnotes/mathAndFootnoteSources';

describe('official Obsidian feature inventory', () => {
  test.each(mathAndFootnoteSources)('O-MATH-FOOTNOTE: %s', (source) => {
    assertStableRoundTrip(source);
  });
});
