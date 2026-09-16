import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { readSample } from '@/tests/support/samples/readSample';
import { collectAllInlines } from '@/tests/support/ast/collectAllInlines';
import { assertStableRoundTrip } from '@/tests/support/assertStableRoundTrip';

describe('official Obsidian feature inventory', () => {
  test('O-COMPOUND: the media laboratory survives repeated whole-document conversion', () => {
    const source = readSample('conversion-core/obsidian-media-laboratory.md');

    const inlines = collectAllInlines(parseObsidian(source).blocks);

    expect(
      inlines.filter((node) => node.type === 'embed').length,
    ).toBeGreaterThanOrEqual(10);

    expect(inlines.some((node) => node.type === 'math')).toBe(true);

    assertStableRoundTrip(source);
  });
});
