import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, open, stat } from 'node:fs/promises';
import path from 'node:path';

async function isExecutable(executablePath) {
  try {
    const executableStat = await stat(executablePath);

    const requiredMode =
      process.platform === 'win32' ? constants.F_OK : constants.X_OK;

    await access(executablePath, requiredMode);

    return executableStat.isFile();
  } catch {
    return false;
  }
}

function getExecutableCandidates() {
  if (process.platform === 'win32') {
    const installationDirectories = [
      process.env.LOCALAPPDATA,
      process.env.ProgramFiles,
      process.env['ProgramFiles(x86)'],
    ].filter(Boolean);

    return installationDirectories.map((directory) =>
      path.join(directory, 'Obsidian', 'Obsidian.exe'),
    );
  }

  return [];
}

async function findPathExecutable(executableName) {
  const pathDirectories = (process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean);

  const pathCandidates = pathDirectories.map((directory) =>
    path.resolve(directory, executableName),
  );

  for (const candidate of pathCandidates) {
    if (await isExecutable(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function findObsidianLauncher(configuredPath) {
  const executableName = configuredPath || 'obsidian';

  const isExplicitPath =
    path.isAbsolute(executableName) || executableName.includes(path.sep);

  if (isExplicitPath) {
    const executablePath = path.resolve(executableName);

    if (await isExecutable(executablePath)) {
      return { executablePath, leadingArguments: [] };
    }

    throw new Error(
      `Obsidian executable is missing or not executable: ${executablePath}`,
    );
  }

  const pathExecutable = await findPathExecutable(executableName);

  if (pathExecutable) {
    return { executablePath: pathExecutable, leadingArguments: [] };
  }

  const candidates = configuredPath ? [] : getExecutableCandidates();

  for (const candidate of candidates) {
    if (await isExecutable(candidate)) {
      return { executablePath: candidate, leadingArguments: [] };
    }
  }

  if (!configuredPath && process.platform === 'darwin') {
    const openExecutable = await findPathExecutable('open');

    if (openExecutable) {
      return {
        executablePath: openExecutable,
        leadingArguments: ['-W', '-n', '-a', 'Obsidian', '--args'],
      };
    }
  }

  throw new Error(
    'Obsidian was not found. Install Obsidian or set OBSIDIAN_EXECUTABLE to its executable (an AppImage also works).',
  );
}

async function assertDirectory(directory, label) {
  const isAbsoluteDirectory =
    typeof directory === 'string' && path.isAbsolute(directory);

  if (!isAbsoluteDirectory) {
    throw new Error(`${label} must be an absolute directory path.`);
  }

  const directoryStat = await stat(directory);

  if (!directoryStat.isDirectory()) {
    throw new Error(`${label} is not a directory: ${directory}`);
  }
}

function waitForStartup(obsidianProcess, logPath) {
  return new Promise((resolve, reject) => {
    const startupTimer = setTimeout(() => {
      obsidianProcess.off('error', handleError);
      obsidianProcess.off('exit', handleExit);

      resolve();
    }, 1000);

    function handleError(error) {
      clearTimeout(startupTimer);
      obsidianProcess.off('exit', handleExit);

      reject(
        new Error(`Could not launch Obsidian. See ${logPath}.`, {
          cause: error,
        }),
      );
    }

    function handleExit(code, signal) {
      clearTimeout(startupTimer);
      obsidianProcess.off('error', handleError);

      reject(
        new Error(
          `Obsidian exited during startup (${signal || `code ${code}`}). See ${logPath}.`,
        ),
      );
    }

    obsidianProcess.once('error', handleError);
    obsidianProcess.once('exit', handleExit);
  });
}

export async function launchObsidian({
  runDirectory,
  profileDirectory,
  vaultDirectory,
  executablePath = process.env.OBSIDIAN_EXECUTABLE,
  debug = false,
}) {
  const directoryValidationPromises = [
    assertDirectory(runDirectory, 'Run directory'),
    assertDirectory(profileDirectory, 'Obsidian profile directory'),
    assertDirectory(vaultDirectory, 'Mock vault directory'),
  ];

  await Promise.all(directoryValidationPromises);

  const obsidianLauncher = await findObsidianLauncher(executablePath);
  const logPath = path.join(runDirectory, 'obsidian.log');

  const argumentsForObsidian = [
    ...obsidianLauncher.leadingArguments,
    `--user-data-dir=${profileDirectory}`,
  ];

  if (debug) {
    argumentsForObsidian.push(
      '--remote-debugging-address=127.0.0.1',
      '--remote-debugging-port=0',
    );
  }

  const obsidianEnvironment = { ...process.env };

  delete obsidianEnvironment.ELECTRON_RUN_AS_NODE;

  const logFile = await open(logPath, 'a');
  let obsidianProcess;

  try {
    // File descriptors keep Electron logging safe after the terminal closes.
    obsidianProcess = spawn(
      obsidianLauncher.executablePath,
      argumentsForObsidian,
      {
        cwd: runDirectory,
        detached: true,
        env: obsidianEnvironment,
        stdio: ['ignore', logFile.fd, logFile.fd],
      },
    );

    await waitForStartup(obsidianProcess, logPath);
  } finally {
    await logFile.close();
  }

  obsidianProcess.unref();

  return { pid: obsidianProcess.pid, logPath, process: obsidianProcess };
}
