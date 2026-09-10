import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { readSample } from '../../../../support/samples/readSample';
import { allInlines } from '../../../../support/ast/traversal/allInlines';
import { stableRoundTrip } from '../../../../support/conversion/stableRoundTrip';

describe('official Obsidian feature inventory', () => {
  test('O-COMPOUND: the media laboratory survives repeated whole-document conversion', () => {
    const source = readSample('conversion-core/obsidian-media-laboratory.md');

    const inlines = allInlines(parseObsidian(source).blocks);

    expect(
      inlines.filter((node) => node.type === 'embed').length,
    ).toBeGreaterThanOrEqual(10);

    expect(inlines.some((node) => node.type === 'math')).toBe(true);

    stableRoundTrip(source);
  });
});
