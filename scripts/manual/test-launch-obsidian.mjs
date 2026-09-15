import assert from 'node:assert/strict';
import { once } from 'node:events';
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { launchObsidian } from './launch-obsidian.mjs';

const fakeObsidianSource = `#!/usr/bin/env node
const fs = require('node:fs');
const invocation = {
  arguments: process.argv.slice(2),
  workingDirectory: process.cwd(),
  stdoutIsFile: fs.fstatSync(1).isFile(),
  stderrIsFile: fs.fstatSync(2).isFile(),
};

console.log(JSON.stringify(invocation));
console.error('Fake Obsidian stderr');
setTimeout(() => process.exit(0), 30000);
`;

async function stopFakeObsidian(fakeProcess) {
  const isFakeProcessRunning =
    fakeProcess.exitCode === null && fakeProcess.signalCode === null;

  if (!isFakeProcessRunning) {
    return;
  }

  fakeProcess.ref();

  const exitPromise = once(fakeProcess, 'exit');

  fakeProcess.kill();
  await exitPromise;
}

async function assertFakeLaunch(
  fixture,
  { debug = false, applicationArguments = [] } = {},
) {
  const launchOptions = { ...fixture };

  const expectedArguments = [
    `--user-data-dir=${fixture.profileDirectory}`,
    ...applicationArguments,
  ];

  launchOptions.applicationArguments = applicationArguments;

  if (debug) {
    launchOptions.debug = true;

    expectedArguments.push(
      '--remote-debugging-address=127.0.0.1',
      '--remote-debugging-port=0',
    );
  }

  const launched = await launchObsidian(launchOptions);

  try {
    const logContents = await readFile(launched.logPath, 'utf8');

    const invocationLine = logContents
      .trim()
      .split('\n')
      .findLast((line) => line.startsWith('{'));

    const invocation = JSON.parse(invocationLine);

    assert.deepEqual(invocation.arguments, expectedArguments);
    assert.equal(invocation.workingDirectory, fixture.runDirectory);

    assert.equal(invocation.stdoutIsFile, true);
    assert.equal(invocation.stderrIsFile, true);
    assert.match(logContents, /Fake Obsidian stderr/);

    assert.equal(
      launched.logPath,
      path.join(fixture.runDirectory, 'obsidian.log'),
    );

    assert.equal(launched.pid, launched.process.pid);
    assert.equal(launched.process.stdin, null);
    assert.equal(launched.process.stdout, null);
    assert.equal(launched.process.stderr, null);
  } finally {
    await stopFakeObsidian(launched.process);
  }
}

const executableTestOptions = {
  skip:
    process.platform === 'win32'
      ? 'The fake executable uses a POSIX shebang.'
      : false,
};

test(
  'launches an isolated application with durable logging and clear failures',
  executableTestOptions,
  async (context) => {
    const temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), 'obsidian-launcher-test & '),
    );

    const runDirectory = await realpath(temporaryDirectory);

    const fixture = {
      runDirectory,
      profileDirectory: path.join(runDirectory, 'isolated profile'),
      vaultDirectory: path.join(runDirectory, 'mock vault'),
      executablePath: path.join(runDirectory, 'fake obsidian'),
    };

    try {
      const directoryCreationPromises = [
        mkdir(fixture.profileDirectory),
        mkdir(fixture.vaultDirectory),
      ];

      await Promise.all(directoryCreationPromises);
      await writeFile(fixture.executablePath, fakeObsidianSource);
      await chmod(fixture.executablePath, 0o755);

      await context.test(
        'passes the exact isolated profile path and uses files for both output streams',
        async () => {
          await assertFakeLaunch(fixture);
        },
      );

      await context.test(
        'enables localhost debugging only when requested',
        async () => {
          await assertFakeLaunch(fixture, { debug: true });
        },
      );

      await context.test(
        'passes application arguments to the isolated Obsidian process',
        async () => {
          await assertFakeLaunch(fixture, {
            applicationArguments: [
              `--tiddlywiki-import-path=${path.join(runDirectory, 'import.json')}`,
            ],
          });
        },
      );

      await context.test(
        'reports an early exit with the log path',
        async () => {
          await writeFile(
            fixture.executablePath,
            '#!/usr/bin/env node\nprocess.exit(7);\n',
          );

          await assert.rejects(launchObsidian(fixture), {
            message: `Obsidian exited during startup (code 7). See ${path.join(runDirectory, 'obsidian.log')}.`,
          });
        },
      );

      await context.test(
        'identifies a missing executable before launching',
        async () => {
          const missingExecutablePath = path.join(
            runDirectory,
            'missing obsidian',
          );

          const launchOptions = {
            ...fixture,
            executablePath: missingExecutablePath,
          };

          await assert.rejects(launchObsidian(launchOptions), {
            message: `Obsidian executable is missing or not executable: ${missingExecutablePath}`,
          });
        },
      );
    } finally {
      await rm(runDirectory, { recursive: true, force: true });
    }
  },
);
