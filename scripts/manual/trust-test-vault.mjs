import { readFile } from 'node:fs/promises';
import path from 'node:path';

const connectionAttempts = 50;
const retryDelayMilliseconds = 200;
const responseTimeoutMilliseconds = 5000;

function waitForRetry() {
  return new Promise((resolve) => setTimeout(resolve, retryDelayMilliseconds));
}

async function readDebuggingPort(profileDirectory) {
  const portFilePath = path.join(profileDirectory, 'DevToolsActivePort');

  for (let attempt = 0; attempt < connectionAttempts; attempt += 1) {
    try {
      const portFile = await readFile(portFilePath, 'utf8');
      const port = Number.parseInt(portFile.split('\n')[0], 10);

      if (Number.isInteger(port) && port > 0) {
        return port;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    await waitForRetry();
  }

  throw new Error(
    `Obsidian did not create its debugging port at ${portFilePath}`,
  );
}

async function findObsidianPage(port) {
  for (let attempt = 0; attempt < connectionAttempts; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = response.ok ? await response.json() : [];
      const pageTarget = targets.find((target) => target.type === 'page');

      if (pageTarget?.webSocketDebuggerUrl) {
        return pageTarget;
      }
    } catch {
      // Obsidian can publish the port before its page target is ready.
    }

    await waitForRetry();
  }

  throw new Error('Obsidian did not expose its test-vault page.');
}

async function evaluateInObsidian(port, expression) {
  const pageTarget = await findObsidianPage(port);
  const socket = new global.WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  const responsePromise = new Promise((resolve, reject) => {
    const responseTimer = setTimeout(() => {
      reject(new Error('Obsidian did not answer the plugin setup request.'));
    }, responseTimeoutMilliseconds);

    socket.addEventListener(
      'message',
      (event) => {
        clearTimeout(responseTimer);
        resolve(JSON.parse(event.data));
      },
      { once: true },
    );

    socket.addEventListener(
      'error',
      (error) => {
        clearTimeout(responseTimer);
        reject(error);
      },
      { once: true },
    );
  });

  socket.send(
    JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression, returnByValue: true },
    }),
  );

  const response = await responsePromise;

  socket.close();

  if (response.error || response.result?.exceptionDetails) {
    throw new Error('Obsidian rejected the plugin setup request.');
  }

  return response.result?.result?.value;
}

async function waitForPlugins(port, pluginIds) {
  const pluginIdsSource = JSON.stringify(pluginIds);
  const loadedPluginsExpression = `JSON.stringify({loaded:Object.keys(app.plugins.plugins),expected:${pluginIdsSource}})`;

  for (let attempt = 0; attempt < connectionAttempts; attempt += 1) {
    try {
      const result = await evaluateInObsidian(port, loadedPluginsExpression);
      const pluginState = JSON.parse(result);

      const areAllPluginsLoaded = pluginState.expected.every((pluginId) =>
        pluginState.loaded.includes(pluginId),
      );

      if (areAllPluginsLoaded) {
        return;
      }
    } catch {
      // The renderer disconnects briefly while the trusted vault reloads.
    }

    await waitForRetry();
  }

  throw new Error(
    `Obsidian did not load the test plugins: ${pluginIds.join(', ')}`,
  );
}

export async function trustTestVault({
  profileDirectory,
  vaultId,
  pluginIds,
  commandId,
}) {
  const port = await readDebuggingPort(profileDirectory);
  const trustKey = `enable-plugin-${vaultId}`;
  const trustExpression = `localStorage.setItem(${JSON.stringify(trustKey)},'true');setTimeout(()=>location.reload(),50);true`;

  await evaluateInObsidian(port, trustExpression);
  await waitForPlugins(port, pluginIds);

  if (commandId) {
    const commandExpression = `app.commands.executeCommandById(${JSON.stringify(commandId)});true`;

    await evaluateInObsidian(port, commandExpression);
  }
}
