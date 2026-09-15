import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPluginBuildContext } from '../build/create-plugin-build-context.mjs';
import { launchObsidian } from './launch-obsidian.mjs';
import { prepareManualTest } from './prepare-manual-test.mjs';
import { trustTestVault } from './trust-test-vault.mjs';

const supportedArguments = ['--no-open'];

const unknownArguments = process.argv
  .slice(2)
  .filter((argument) => !supportedArguments.includes(argument));

if (unknownArguments.length > 0) {
  throw new Error(
    `Unknown arguments: ${unknownArguments.join(', ')}. Use --no-open to prepare without launching Obsidian.`,
  );
}

const prepared = await prepareManualTest();
const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const guidePath = path.relative(projectDirectory, prepared.guidePath);
const vaultPath = path.relative(projectDirectory, prepared.vaultDirectory);
const importPath = path.relative(projectDirectory, prepared.importJsonPath);

console.log(`\nManual test instructions: ${guidePath}`);
console.log(`Mock vault: ${vaultPath}`);
console.log(`TiddlyWiki JSON: ${importPath}`);

if (!process.argv.includes('--no-open')) {
  const context = await createPluginBuildContext({
    pluginFolder: prepared.pluginDirectory,
    outfile: path.join(prepared.runDirectory, 'main.js'),
    absWorkingDir: projectDirectory,
  });

  try {
    await context.rebuild();
    await context.watch();

    const obsidian = await launchObsidian({
      runDirectory: prepared.runDirectory,
      profileDirectory: prepared.profileDirectory,
      vaultDirectory: prepared.vaultDirectory,
      debug: true,
      applicationArguments: [
        `--tiddlywiki-import-path=${prepared.importJsonPath}`,
      ],
    });

    await trustTestVault({
      profileDirectory: prepared.profileDirectory,
      vaultId: prepared.vaultId,
      pluginIds: ['hot-reload', 'tiddlywiki-import-export'],
      commandId: 'tiddlywiki-import-export:import-tiddlywiki-json',
    });

    obsidian.process.once('exit', () => context.dispose());
    process.once('SIGINT', () => context.dispose());
    process.once('SIGTERM', () => context.dispose());

    const logPath = path.relative(projectDirectory, obsidian.logPath);

    console.log(`Obsidian started (PID ${obsidian.pid}). Logs: ${logPath}`);
    console.log('The mock vault is trusted and both plugins are loaded.');
    console.log('The import picker is open with the test JSON selected.');

    console.log(
      'Hot Reload is watching the current source. Keep this terminal open; Ctrl+C stops watching.',
    );
  } catch (error) {
    await context.dispose();

    throw error;
  }
}
