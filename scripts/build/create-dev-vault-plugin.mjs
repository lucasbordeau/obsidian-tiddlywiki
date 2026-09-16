import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function createDevVaultPlugin(pluginFolder) {
  return {
    name: 'deploy-to-dev-vault',
    setup(build) {
      const workingDirectory =
        build.initialOptions.absWorkingDir ?? process.cwd();

      const bundlePath = path.resolve(
        workingDirectory,
        build.initialOptions.outfile,
      );

      const manifestPath = path.join(workingDirectory, 'manifest.json');
      const stylesheetPath = path.join(workingDirectory, 'styles.css');

      build.onEnd(async (result) => {
        if (result.errors.length > 0) {
          return;
        }

        await mkdir(pluginFolder, { recursive: true });
        await copyFile(manifestPath, path.join(pluginFolder, 'manifest.json'));
        await copyFile(stylesheetPath, path.join(pluginFolder, 'styles.css'));
        await writeFile(path.join(pluginFolder, '.hotreload'), '');
        await copyFile(bundlePath, path.join(pluginFolder, 'main.js'));
      });
    },
  };
}
