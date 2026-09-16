import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { dialects } from '@/modules/conversion-core/lexing/__tests__/dialects';
import { adversarialSources } from '@/modules/conversion-core/lexing/__tests__/adversarialSources';

describe('concrete source tokens', () => {
  for (const dialect of dialects) {
    test.each(adversarialSources)(
      `${dialect}: exact UTF-16 source reconstruction %j`,
      (source) => {
        const tokens = lexSource(source, dialect);

        expect(tokens.map((token) => token.raw).join('')).toBe(source);

        let previousEnd = 0;

        for (const token of tokens) {
          expect(token.range.start).toBe(previousEnd);
          expect(token.range.end).toBeGreaterThan(token.range.start);

          expect(token.raw).toBe(
            source.slice(token.range.start, token.range.end),
          );

          previousEnd = token.range.end;
        }

        expect(previousEnd).toBe(source.length);
      },
    );
  }

  test('large unfinished delimiter inputs terminate without losing text', () => {
    const source = '[ broken ( ** __ \\ \r\n'.repeat(1000) + '🙂';

    expect(
      lexSource(source, 'obsidian')
        .map((token) => token.raw)
        .join(''),
    ).toBe(source);
  });
});
