import { build } from 'esbuild';

const bundleFormats = [
  { format: 'esm', outfile: 'dist/conversion-core.mjs' },
  { format: 'cjs', outfile: 'dist/conversion-core.cjs' },
];

for (const bundleFormat of bundleFormats) {
  await build({
    entryPoints: ['src/conversion.ts'],
    bundle: true,
    platform: 'browser',
    target: 'es2018',
    format: bundleFormat.format,
    outfile: bundleFormat.outfile,
    sourcemap: true,
    logLevel: 'info',
    tsconfig: 'tsconfig.json',
  });
}
