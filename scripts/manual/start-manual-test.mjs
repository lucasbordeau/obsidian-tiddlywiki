import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';

async function pathExists(candidatePath) {
  try {
    await access(candidatePath);

    return true;
  } catch {
    return false;
  }
}

function runNpm(argumentsForNpm) {
  return new Promise((resolve, reject) => {
    const npmProcess = spawn(npmExecutable, argumentsForNpm, {
      cwd: projectDirectory,
      stdio: 'inherit',
    });

    npmProcess.once('error', reject);

    npmProcess.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();

        return;
      }

      const exitReason = signal ? `signal ${signal}` : `code ${code}`;

      reject(
        new Error(
          `npm ${argumentsForNpm.join(' ')} exited with ${exitReason}.`,
        ),
      );
    });
  });
}

const requiredDependencyPaths = [
  'node_modules/.bin/tsc',
  'node_modules/esbuild/package.json',
  'node_modules/tiddlywiki/package.json',
].map((relativePath) => path.join(projectDirectory, relativePath));

const dependencyChecks = requiredDependencyPaths.map(pathExists);
const installedDependencies = await Promise.all(dependencyChecks);
const areDependenciesReady = installedDependencies.every(Boolean);

if (!areDependenciesReady) {
  console.log('Installing the repository dependencies for this first run…');
  await runNpm(['ci']);
}

await runNpm(['run', 'build']);
await import('./manual-test.mjs');
