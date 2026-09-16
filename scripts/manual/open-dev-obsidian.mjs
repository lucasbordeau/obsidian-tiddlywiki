import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createPluginBuildContext } from '../build/create-plugin-build-context.mjs';

const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));

const defaultPluginFolder =
  './.dev-vault/.obsidian/plugins/tiddlywiki-import-export';

export function getDevelopmentPaths(pluginFolderSetting, pluginId) {
  const pluginFolder = path.resolve(projectDirectory, pluginFolderSetting);
  const pluginsDirectory = path.dirname(pluginFolder);
  const settingsDirectory = path.dirname(pluginsDirectory);

  const isPluginFolder =
    path.basename(pluginFolder) === pluginId &&
    path.basename(pluginsDirectory) === 'plugins' &&
    path.basename(settingsDirectory) === '.obsidian';

  if (!isPluginFolder) {
    throw new Error(
      `DEV_VAULT_PLUGIN_FOLDER must end in .obsidian/plugins/${pluginId}.`,
    );
  }

  return {
    pluginFolder,
    vaultDirectory: path.dirname(settingsDirectory),
    profileDirectory: path.join(projectDirectory, '.dev-obsidian-profile'),
  };
}

async function readJsonIfPresent(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }

    throw error;
  }
}

export async function prepareDevelopmentVault({
  vaultDirectory,
  profileDirectory,
  pluginId,
}) {
  const settingsDirectory = path.join(vaultDirectory, '.obsidian');
  const appSettingsPath = path.join(settingsDirectory, 'app.json');

  const enabledPluginsPath = path.join(
    settingsDirectory,
    'community-plugins.json',
  );

  const profileSettingsPath = path.join(profileDirectory, 'obsidian.json');

  await mkdir(settingsDirectory, { recursive: true });
  await mkdir(profileDirectory, { recursive: true });

  const appSettings = await readJsonIfPresent(appSettingsPath, {});
  const enabledPlugins = await readJsonIfPresent(enabledPluginsPath, []);

  const profileSettings = await readJsonIfPresent(profileSettingsPath, {
    vaults: {},
  });

  if (!Array.isArray(enabledPlugins) || !enabledPlugins.every(isPluginId)) {
    throw new Error(`Invalid Obsidian plugin list: ${enabledPluginsPath}`);
  }

  if (!isSettingsObject(appSettings) || !isSettingsObject(profileSettings)) {
    throw new Error('Invalid Obsidian development vault settings.');
  }

  const vaults = profileSettings.vaults ?? {};

  if (!isSettingsObject(vaults)) {
    throw new Error(`Invalid Obsidian vault registry: ${profileSettingsPath}`);
  }

  const registeredVault = Object.entries(vaults).find(
    ([, registration]) => registration?.path === vaultDirectory,
  );

  const vaultId = registeredVault?.[0] ?? randomBytes(8).toString('hex');

  if (appSettings.safeMode !== false) {
    await writeFile(
      appSettingsPath,
      `${JSON.stringify({ ...appSettings, safeMode: false }, null, 2)}\n`,
    );
  }

  if (!enabledPlugins.includes(pluginId)) {
    await writeFile(
      enabledPluginsPath,
      `${JSON.stringify([...enabledPlugins, pluginId], null, 2)}\n`,
    );
  }

  vaults[vaultId] = {
    ...vaults[vaultId],
    path: vaultDirectory,
    ts: Date.now(),
    open: true,
  };

  profileSettings.vaults = vaults;

  await writeFile(
    profileSettingsPath,
    `${JSON.stringify(profileSettings, null, 2)}\n`,
  );

  return vaultId;
}

function isPluginId(value) {
  return typeof value === 'string';
}

function isSettingsObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function getObsidianOpenCommand(
  profileDirectory,
  platform = process.platform,
  executablePath = process.env.OBSIDIAN_EXECUTABLE,
) {
  const profileArgument = `--user-data-dir=${profileDirectory}`;

  if (executablePath) {
    return { executable: executablePath, arguments: [profileArgument] };
  }

  if (platform === 'darwin') {
    return {
      executable: 'open',
      arguments: ['-n', '-a', 'Obsidian', '--args', profileArgument],
    };
  }

  if (platform === 'linux') {
    return { executable: 'obsidian', arguments: [profileArgument] };
  }

  throw new Error(
    'Set OBSIDIAN_EXECUTABLE to the Obsidian executable on this platform.',
  );
}

export async function openDevelopmentObsidian(
  profileDirectory,
  platform = process.platform,
  executablePath = process.env.OBSIDIAN_EXECUTABLE,
) {
  const openCommand = getObsidianOpenCommand(
    profileDirectory,
    platform,
    executablePath,
  );

  const applicationEnvironment = { ...process.env };

  delete applicationEnvironment.ELECTRON_RUN_AS_NODE;

  return new Promise((resolve, reject) => {
    const obsidianProcess = spawn(
      openCommand.executable,
      openCommand.arguments,
      {
        detached: true,
        env: applicationEnvironment,
        stdio: 'ignore',
      },
    );

    obsidianProcess.once('error', reject);

    if (platform === 'darwin' && !executablePath) {
      obsidianProcess.once('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Could not open Obsidian (exit code ${code}).`));

          return;
        }

        resolve();
      });
    } else {
      obsidianProcess.once('spawn', resolve);
    }

    obsidianProcess.unref();
  });
}

export async function startDevelopmentObsidian({
  openApplication = true,
  pluginFolderSetting,
  profileDirectory,
  outfile,
} = {}) {
  dotenv.config({ path: path.join(projectDirectory, '.env') });

  const manifest = JSON.parse(
    await readFile(path.join(projectDirectory, 'manifest.json'), 'utf8'),
  );

  const configuredPluginFolder =
    pluginFolderSetting ??
    process.env.DEV_VAULT_PLUGIN_FOLDER ??
    defaultPluginFolder;

  const developmentPaths = getDevelopmentPaths(
    configuredPluginFolder,
    manifest.id,
  );

  const isolatedProfileDirectory =
    profileDirectory ?? developmentPaths.profileDirectory;

  await prepareDevelopmentVault({
    vaultDirectory: developmentPaths.vaultDirectory,
    profileDirectory: isolatedProfileDirectory,
    pluginId: manifest.id,
  });

  const buildContext = await createPluginBuildContext({
    absWorkingDir: projectDirectory,
    pluginFolder: developmentPaths.pluginFolder,
    outfile,
  });

  try {
    await buildContext.rebuild();

    if (!openApplication) {
      await buildContext.dispose();

      return developmentPaths.vaultDirectory;
    }

    await buildContext.watch();
    await openDevelopmentObsidian(isolatedProfileDirectory);
  } catch (error) {
    await buildContext.dispose();

    throw error;
  }

  process.once('SIGINT', () => void buildContext.dispose());
  process.once('SIGTERM', () => void buildContext.dispose());

  return developmentPaths.vaultDirectory;
}

const invokedScriptPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;

const isInvokedDirectly = invokedScriptPath === fileURLToPath(import.meta.url);

if (isInvokedDirectly) {
  const argumentsForLauncher = process.argv.slice(2);

  const isBuildOnly =
    argumentsForLauncher.length === 1 &&
    argumentsForLauncher[0] === '--no-open';

  if (argumentsForLauncher.length > 0 && !isBuildOnly) {
    throw new Error('Only --no-open is supported.');
  }

  const vaultDirectory = await startDevelopmentObsidian({
    openApplication: !isBuildOnly,
  });

  console.log(
    isBuildOnly
      ? `Plugin installed in ${vaultDirectory}`
      : `Opened Obsidian with ${vaultDirectory}. Watching for changes; Ctrl+C stops the watcher.`,
  );
}
