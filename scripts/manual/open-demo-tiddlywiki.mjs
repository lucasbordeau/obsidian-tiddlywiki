import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const demoDirectory = path.join(projectDirectory, 'manual-test', 'tiddlywiki');

export const demoTiddlyWikiPath = path.join(
  demoDirectory,
  'basic-feature-demo.html',
);

export const emptyTiddlyWikiPath = path.join(demoDirectory, 'empty.html');

export function getDemoTiddlyWikiPath(commandArguments = []) {
  const opensEmptyWiki = commandArguments.includes('--empty');

  return opensEmptyWiki ? emptyTiddlyWikiPath : demoTiddlyWikiPath;
}

export function getDemoOpenCommand(filePath, platform = process.platform) {
  if (platform === 'darwin') {
    return { executable: 'open', arguments: [filePath] };
  }

  if (platform === 'win32') {
    return { executable: 'explorer.exe', arguments: [filePath] };
  }

  if (platform === 'linux') {
    return { executable: 'xdg-open', arguments: [filePath] };
  }

  return undefined;
}

export async function openDemoTiddlyWiki(
  filePath = demoTiddlyWikiPath,
  platform = process.platform,
) {
  await access(filePath);

  const openCommand = getDemoOpenCommand(filePath, platform);

  if (!openCommand) {
    throw new Error(
      `Opening the demo is unsupported on ${platform}: ${filePath}`,
    );
  }

  return new Promise((resolve, reject) => {
    const demoProcess = spawn(openCommand.executable, openCommand.arguments, {
      detached: true,
      stdio: 'ignore',
    });

    demoProcess.once('spawn', () => {
      demoProcess.unref();
      resolve(filePath);
    });

    demoProcess.once('error', reject);
  });
}

const invokedScriptPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;

const isInvokedDirectly = invokedScriptPath === fileURLToPath(import.meta.url);

if (isInvokedDirectly) {
  const selectedDemoPath = getDemoTiddlyWikiPath(process.argv.slice(2));

  await openDemoTiddlyWiki(selectedDemoPath);

  console.log(`Opened TiddlyWiki: ${selectedDemoPath}`);
}
