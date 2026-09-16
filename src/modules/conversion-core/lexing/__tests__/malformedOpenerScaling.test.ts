import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { Dialect } from '@/modules/conversion-core/model/Dialect';

const malformedOpenerCases: {
  name: string;
  dialect: Dialect;
  unit: string;
  malformedKind: 'link' | 'macro';
}[] = [
  {
    name: 'Obsidian wiki links',
    dialect: 'obsidian',
    unit: '[[',
    malformedKind: 'link',
  },
  {
    name: 'TiddlyWiki wiki links',
    dialect: 'tiddlywiki',
    unit: '[[',
    malformedKind: 'link',
  },
  {
    name: 'TiddlyWiki macros',
    dialect: 'tiddlywiki',
    unit: '<<a',
    malformedKind: 'macro',
  },
];

function measureMedianLexingMilliseconds(
  source: string,
  dialect: Dialect,
): number {
  const elapsedMilliseconds: number[] = [];

  for (let attempt = 0; attempt < 3; attempt++) {
    const start = performance.now();

    lexSource(source, dialect);

    elapsedMilliseconds.push(performance.now() - start);
  }

  elapsedMilliseconds.sort((left, right) => left - right);

  return elapsedMilliseconds[1];
}

describe('malformed opener scaling and recovery', () => {
  test.each(malformedOpenerCases)(
    '$name scale below a quadratic growth ratio',
    ({ dialect, unit }) => {
      const shorterSource = unit.repeat(4000);
      const longerSource = unit.repeat(8000);

      measureMedianLexingMilliseconds(shorterSource, dialect);

      const shorterMilliseconds = measureMedianLexingMilliseconds(
        shorterSource,
        dialect,
      );

      const longerMilliseconds = measureMedianLexingMilliseconds(
        longerSource,
        dialect,
      );

      const growthRatio = longerMilliseconds / shorterMilliseconds;

      expect(growthRatio).toBeLessThan(3.2);
    },
    20_000,
  );

  test.each(malformedOpenerCases)(
    '$name leave a valid link after a line break available',
    ({ dialect, unit, malformedKind }) => {
      const source = `${unit.repeat(2000)}\n[[valid]]`;
      const validLinkStart = source.indexOf('[[valid]]');

      const tokens = lexSource(source, dialect);

      const malformedSyntaxTokens = tokens.filter(
        (token) =>
          token.kind === malformedKind && token.range.start < validLinkStart,
      );

      expect(malformedSyntaxTokens).toEqual([]);

      expect(tokens.filter((token) => token.kind === 'link')).toEqual([
        {
          kind: 'link',
          range: { start: validLinkStart, end: source.length },
          raw: '[[valid]]',
        },
      ]);
    },
  );
});
