import { spawn } from 'node:child_process';
import path from 'node:path';

export function getFileRevealCommand(filePath, platform = process.platform) {
  if (platform === 'darwin') {
    return { executable: 'open', arguments: ['-R', filePath] };
  }

  if (platform === 'win32') {
    return {
      executable: 'explorer.exe',
      arguments: [`/select,${filePath}`],
    };
  }

  if (platform === 'linux') {
    return {
      executable: 'xdg-open',
      arguments: [path.dirname(filePath)],
    };
  }

  return undefined;
}

export function revealManualFile(filePath) {
  const revealCommand = getFileRevealCommand(filePath);

  if (!revealCommand) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const revealProcess = spawn(
      revealCommand.executable,
      revealCommand.arguments,
      {
        detached: true,
        stdio: 'ignore',
      },
    );

    revealProcess.once('spawn', () => {
      revealProcess.unref();
      resolve(true);
    });

    revealProcess.once('error', () => resolve(false));
  });
}
