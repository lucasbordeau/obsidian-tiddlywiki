import assert from 'node:assert/strict';
import {
  access,
  cp,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { installHotReload } from './install-hot-reload.mjs';

const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const vendorPath = 'manual-test/vendor/hot-reload';

async function createTestDirectory(context) {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), 'hot-reload-install-'),
  );

  context.after(() => rm(directory, { recursive: true, force: true }));

  return directory;
}

test('installs the pinned Hot Reload assets and redistribution license offline', async (context) => {
  const testDirectory = await createTestDirectory(context);
  const pluginDirectory = path.join(testDirectory, 'hot-reload');

  context.mock.method(global, 'fetch', () => {
    throw new Error('Manual testing must install Hot Reload offline.');
  });

  const installedPlugin = await installHotReload({
    projectDirectory,
    pluginDirectory,
  });

  assert.equal(installedPlugin.id, 'hot-reload');
  assert.equal(installedPlugin.version, '0.3.1');

  assert.deepEqual((await readdir(pluginDirectory)).sort(), [
    'LICENSE',
    'main.js',
    'manifest.json',
  ]);

  const installedFilenames = [
    ['main.js', 'main.cjs'],
    ['manifest.json', 'manifest.json'],
    ['LICENSE', 'LICENSE'],
  ];

  for (const [installedFilename, sourceFilename] of installedFilenames) {
    const [installedContent, sourceContent] = await Promise.all([
      readFile(path.join(pluginDirectory, installedFilename)),
      readFile(path.join(projectDirectory, vendorPath, sourceFilename)),
    ]);

    assert.deepEqual(installedContent, sourceContent, installedFilename);
  }
});

for (const filename of ['main.cjs', 'manifest.json', 'LICENSE']) {
  test(`rejects a modified ${filename} before creating an installed plugin`, async (context) => {
    const testDirectory = await createTestDirectory(context);
    const pluginDirectory = path.join(testDirectory, 'hot-reload');
    const copiedVendorDirectory = path.join(testDirectory, vendorPath);

    await cp(path.join(projectDirectory, vendorPath), copiedVendorDirectory, {
      recursive: true,
    });

    await writeFile(
      path.join(copiedVendorDirectory, filename),
      'Modified asset',
    );

    await assert.rejects(
      installHotReload({ projectDirectory: testDirectory, pluginDirectory }),
      /failed SHA-256 verification/,
    );

    await assert.rejects(access(pluginDirectory), { code: 'ENOENT' });
  });
}
