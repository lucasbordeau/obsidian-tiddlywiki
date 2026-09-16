import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import esbuild from 'esbuild';
import { createDevVaultPlugin } from './create-dev-vault-plugin.mjs';

test('deploys successful builds, preserves the working bundle on failure, and recovers', async () => {
  const projectFolder = await mkdtemp(
    path.join(os.tmpdir(), 'obsidian-dev-build-'),
  );

  const pluginFolder = path.join(
    projectFolder,
    'vault/.obsidian/plugins/example',
  );

  const sourcePath = path.join(projectFolder, 'source.js');
  const installedBundlePath = path.join(pluginFolder, 'main.js');
  const manifest = JSON.stringify({ id: 'example', version: '1.0.0' });
  let esbuildContext;

  try {
    await writeFile(sourcePath, 'console.log("initial build");');
    await writeFile(path.join(projectFolder, 'manifest.json'), manifest);

    esbuildContext = await esbuild.context({
      absWorkingDir: projectFolder,
      entryPoints: ['source.js'],
      outfile: 'main.js',
      bundle: true,
      logLevel: 'silent',
      plugins: [createDevVaultPlugin(pluginFolder)],
    });

    await esbuildContext.rebuild();

    assert.match(await readFile(installedBundlePath, 'utf8'), /initial build/);

    assert.equal(
      await readFile(path.join(pluginFolder, 'manifest.json'), 'utf8'),
      manifest,
    );

    assert.equal(
      await readFile(path.join(pluginFolder, '.hotreload'), 'utf8'),
      '',
    );

    await writeFile(sourcePath, 'console.log("second build");');
    await esbuildContext.rebuild();

    const workingBundle = await readFile(installedBundlePath, 'utf8');

    assert.match(workingBundle, /second build/);

    await writeFile(sourcePath, 'const broken = ;');

    await assert.rejects(esbuildContext.rebuild(), /Build failed/);
    assert.equal(await readFile(installedBundlePath, 'utf8'), workingBundle);

    await writeFile(sourcePath, 'console.log("recovered build");');
    await esbuildContext.rebuild();

    assert.match(
      await readFile(installedBundlePath, 'utf8'),
      /recovered build/,
    );
  } finally {
    await esbuildContext?.dispose();
    await rm(projectFolder, { recursive: true, force: true });
  }
});
