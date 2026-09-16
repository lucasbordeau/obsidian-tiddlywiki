import { lexSource } from '@/modules/conversion-core/lexing/lexSource';

const scalingCases = [
  { name: 'unmatched Markdown link openers', unit: '[x', repeatCount: 8000 },
  {
    name: 'unfinished nested Markdown destinations',
    unit: '[x](',
    repeatCount: 4000,
  },
  { name: 'line-prefix quote markers', unit: '>', repeatCount: 16000 },
] as const;

function measureMedianLexingMilliseconds(source: string): number {
  const elapsedMilliseconds: number[] = [];

  for (let attempt = 0; attempt < 3; attempt++) {
    const start = performance.now();

    lexSource(source, 'obsidian');

    elapsedMilliseconds.push(performance.now() - start);
  }

  elapsedMilliseconds.sort((left, right) => left - right);

  return elapsedMilliseconds[1];
}

describe('lexer scaling regressions', () => {
  test.each(scalingCases)(
    '$name scales below a quadratic growth ratio',
    ({ unit, repeatCount }) => {
      const shorterSource = unit.repeat(repeatCount);
      const longerSource = unit.repeat(repeatCount * 2);

      measureMedianLexingMilliseconds(shorterSource);

      const shorterMilliseconds =
        measureMedianLexingMilliseconds(shorterSource);

      const longerMilliseconds = measureMedianLexingMilliseconds(longerSource);
      const growthRatio = longerMilliseconds / shorterMilliseconds;

      expect(growthRatio).toBeLessThan(3.2);
    },
    20_000,
  );
});
