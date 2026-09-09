import { build } from 'esbuild';

const formats = [
  { format: 'esm', outfile: 'dist/conversion-core.mjs' },
  { format: 'cjs', outfile: 'dist/conversion-core.cjs' },
];
for (const output of formats) {
  await build({
    entryPoints: ['src/conversion.ts'],
    bundle: true,
    platform: 'browser',
    target: 'es2018',
    format: output.format,
    outfile: output.outfile,
    sourcemap: true,
    logLevel: 'info',
  });
}
