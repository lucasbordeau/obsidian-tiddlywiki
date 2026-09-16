import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  getDevelopmentPaths,
  getObsidianOpenCommand,
  prepareDevelopmentVault,
  startDevelopmentObsidian,
} from './open-dev-obsidian.mjs';

test('derives the vault from the configured plugin folder', () => {
  const paths = getDevelopmentPaths(
    './.dev-vault/.obsidian/plugins/tiddlywiki-import-export',
    'tiddlywiki-import-export',
  );

  assert.equal(path.basename(paths.vaultDirectory), '.dev-vault');
  assert.equal(path.basename(paths.profileDirectory), '.dev-obsidian-profile');

  assert.throws(
    () => getDevelopmentPaths('/tmp/unrelated', 'tiddlywiki-import-export'),
    /DEV_VAULT_PLUGIN_FOLDER must end in/,
  );
});

test('opens an isolated Obsidian profile on macOS or with an explicit executable', () => {
  const profileDirectory = '/tmp/obsidian-test-profile';

  assert.deepEqual(getObsidianOpenCommand(profileDirectory, 'darwin', ''), {
    executable: 'open',
    arguments: [
      '-n',
      '-a',
      'Obsidian',
      '--args',
      `--user-data-dir=${profileDirectory}`,
    ],
  });

  assert.deepEqual(
    getObsidianOpenCommand(profileDirectory, 'linux', '/opt/Obsidian.AppImage'),
    {
      executable: '/opt/Obsidian.AppImage',
      arguments: [`--user-data-dir=${profileDirectory}`],
    },
  );

  assert.throws(
    () => getObsidianOpenCommand(profileDirectory, 'win32', ''),
    /Set OBSIDIAN_EXECUTABLE/,
  );
});

test('enables the plugin and registers only the development vault', async () => {
  const testDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'obsidian-dev-launch-'),
  );

  const vaultDirectory = path.join(testDirectory, 'vault');
  const profileDirectory = path.join(testDirectory, 'profile');
  const settingsDirectory = path.join(vaultDirectory, '.obsidian');
  const pluginId = 'tiddlywiki-import-export';

  try {
    await mkdir(settingsDirectory, { recursive: true });

    await writeFile(
      path.join(settingsDirectory, 'app.json'),
      JSON.stringify({ theme: 'moonstone', safeMode: true }),
    );

    await writeFile(
      path.join(settingsDirectory, 'community-plugins.json'),
      JSON.stringify(['another-plugin']),
    );

    const vaultId = await prepareDevelopmentVault({
      vaultDirectory,
      profileDirectory,
      pluginId,
    });

    const repeatedVaultId = await prepareDevelopmentVault({
      vaultDirectory,
      profileDirectory,
      pluginId,
    });

    const appSettings = JSON.parse(
      await readFile(path.join(settingsDirectory, 'app.json'), 'utf8'),
    );

    const enabledPlugins = JSON.parse(
      await readFile(
        path.join(settingsDirectory, 'community-plugins.json'),
        'utf8',
      ),
    );

    const profileSettings = JSON.parse(
      await readFile(path.join(profileDirectory, 'obsidian.json'), 'utf8'),
    );

    assert.equal(repeatedVaultId, vaultId);
    assert.deepEqual(appSettings, { theme: 'moonstone', safeMode: false });
    assert.deepEqual(enabledPlugins, ['another-plugin', pluginId]);
    assert.equal(profileSettings.vaults[vaultId].path, vaultDirectory);
    assert.equal(profileSettings.vaults[vaultId].open, true);
    assert.equal(Object.keys(profileSettings.vaults).length, 1);
  } finally {
    await rm(testDirectory, { recursive: true, force: true });
  }
});

test('build-only launch installs a bundle and releases the build context', async () => {
  const testDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'obsidian-dev-build-only-'),
  );

  const vaultDirectory = path.join(testDirectory, 'vault');

  const pluginFolder = path.join(
    vaultDirectory,
    '.obsidian',
    'plugins',
    'tiddlywiki-import-export',
  );

  try {
    const preparedVault = await startDevelopmentObsidian({
      openApplication: false,
      pluginFolderSetting: pluginFolder,
      profileDirectory: path.join(testDirectory, 'profile'),
      outfile: path.join(testDirectory, 'bundle.js'),
    });

    const installedBundle = await readFile(
      path.join(pluginFolder, 'main.js'),
      'utf8',
    );

    assert.equal(preparedVault, vaultDirectory);
    assert.match(installedBundle, /THIS IS A GENERATED\/BUNDLED FILE/);
  } finally {
    await rm(testDirectory, { recursive: true, force: true });
  }
});
