import { ESLint } from 'eslint';
import { createEslint } from './create-eslint.mjs';

const sourcePatterns = [
  'src/**/*.ts',
  'scripts/*.mjs',
  'eslint-rules/*.mjs',
  '*.js',
  '*.mjs',
];
if (process.argv.includes('--fix')) {
  for (const stage of ['structure', 'format']) {
    const fixer = createEslint(stage);
    const fixedReports = await fixer.lintFiles(sourcePatterns);
    const hasSyntaxErrors = fixedReports.some(
      (report) => report.fatalErrorCount > 0,
    );
    if (hasSyntaxErrors) {
      const formatter = await fixer.loadFormatter('stylish');
      process.stderr.write(formatter.format(fixedReports));
      throw new Error('Lint fixes were not written because parsing failed.');
    }
    await ESLint.outputFixes(fixedReports);
  }
}
const eslint = createEslint();
const reports = await eslint.lintFiles(sourcePatterns);
const formatter = await eslint.loadFormatter('stylish');
const formatted = formatter.format(reports);
if (formatted) {
  process.stdout.write(formatted);
}
const hasErrors = reports.some((report) => report.errorCount > 0);
process.exitCode = hasErrors ? 1 : 0;
