import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function configureTestVault({
  vaultDirectory,
  profileDirectory,
  pluginId,
}) {
  const settingsDirectory = path.join(vaultDirectory, '.obsidian');
  const guideLeafId = randomBytes(8).toString('hex');
  const vaultId = randomBytes(8).toString('hex');

  const guideLeaf = {
    id: guideLeafId,
    type: 'leaf',
    state: {
      type: 'markdown',
      state: { file: 'MANUAL-TEST.md', mode: 'preview', source: false },
    },
  };

  const workspace = {
    main: {
      id: randomBytes(8).toString('hex'),
      type: 'split',
      children: [
        {
          id: randomBytes(8).toString('hex'),
          type: 'tabs',
          children: [guideLeaf],
        },
      ],
      direction: 'vertical',
    },
    left: {
      id: randomBytes(8).toString('hex'),
      type: 'split',
      children: [
        {
          id: randomBytes(8).toString('hex'),
          type: 'tabs',
          children: [
            {
              id: randomBytes(8).toString('hex'),
              type: 'leaf',
              state: {
                type: 'file-explorer',
                state: { sortOrder: 'alphabetical' },
              },
            },
          ],
        },
      ],
      direction: 'horizontal',
      width: 280,
    },
    right: {
      id: randomBytes(8).toString('hex'),
      type: 'split',
      children: [],
      direction: 'horizontal',
      width: 300,
      collapsed: true,
    },
    active: guideLeafId,
    lastOpenFiles: ['OB-Start.md'],
  };

  const vaults = {};

  vaults[vaultId] = { path: vaultDirectory, ts: Date.now(), open: true };

  await mkdir(settingsDirectory, { recursive: true });
  await mkdir(profileDirectory, { recursive: true });

  await writeFile(
    path.join(settingsDirectory, 'app.json'),
    JSON.stringify({ safeMode: false }),
  );

  await writeFile(
    path.join(settingsDirectory, 'community-plugins.json'),
    JSON.stringify(['hot-reload', pluginId]),
  );

  await writeFile(
    path.join(settingsDirectory, 'workspace.json'),
    JSON.stringify(workspace),
  );

  await writeFile(
    path.join(profileDirectory, 'obsidian.json'),
    JSON.stringify({ vaults }),
  );

  return { vaultId };
}
