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

  test('distinct unmatched backtick runs scale with source length', () => {
    const createSource = (runCount: number) =>
      Array.from({ length: runCount }, (_, index) =>
        '`'.repeat(index + 1),
      ).join('x');

    const shorterSource = createSource(240);
    const longerSource = createSource(480);

    measureMedianLexingMilliseconds(shorterSource);

    const shorterMilliseconds = measureMedianLexingMilliseconds(shorterSource);
    const longerMilliseconds = measureMedianLexingMilliseconds(longerSource);
    const growthRatio = longerMilliseconds / shorterMilliseconds;

    expect(growthRatio).toBeLessThan(6);
  }, 20_000);
});
