import {
  cp,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManualWikis } from './build-manual-wikis.mjs';
import { configureTestVault } from './configure-test-vault.mjs';
import { installHotReload } from './install-hot-reload.mjs';

const repositoryDirectory = fileURLToPath(new URL('../../', import.meta.url));

export async function prepareManualTest({
  projectDirectory = repositoryDirectory,
  outputDirectory = path.join(projectDirectory, 'manual-test', 'runs'),
} = {}) {
  const manifestPath = path.join(projectDirectory, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const pluginBundle = await readFile(path.join(projectDirectory, 'main.js'));
  const manualTestDirectory = path.join(projectDirectory, 'manual-test');

  const vaultTemplateDirectory = path.join(
    manualTestDirectory,
    'obsidian-vault',
  );

  await mkdir(outputDirectory, { recursive: true });

  const runDirectory = await mkdtemp(path.join(outputDirectory, 'run-'));
  const vaultDirectory = path.join(runDirectory, 'Obsidian test vault');
  const settingsDirectory = path.join(vaultDirectory, '.obsidian');
  const pluginDirectory = path.join(settingsDirectory, 'plugins', manifest.id);
  const profileDirectory = path.join(runDirectory, 'profile');
  const wikiDirectory = path.join(vaultDirectory, 'TiddlyWiki test files');

  await cp(vaultTemplateDirectory, vaultDirectory, { recursive: true });

  await mkdir(pluginDirectory, { recursive: true });
  await writeFile(path.join(pluginDirectory, 'main.js'), pluginBundle);
  await copyFile(manifestPath, path.join(pluginDirectory, 'manifest.json'));

  await writeFile(path.join(pluginDirectory, '.hotreload'), '');

  await installHotReload({
    projectDirectory,
    pluginDirectory: path.join(settingsDirectory, 'plugins/hot-reload'),
  });

  const vaultConfiguration = await configureTestVault({
    vaultDirectory,
    profileDirectory,
    pluginId: manifest.id,
  });

  const wikiSummary = await buildManualWikis({
    outputDirectory: wikiDirectory,
    fixturesDirectory: manualTestDirectory,
    mediaDirectory: vaultTemplateDirectory,
  });

  const guidePath = path.join(vaultDirectory, 'MANUAL-TEST.md');

  return {
    runDirectory,
    vaultDirectory,
    pluginDirectory,
    profileDirectory,
    guidePath,
    vaultId: vaultConfiguration.vaultId,
    ...wikiSummary,
  };
}
