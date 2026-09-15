import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const hotReloadVersion = '0.3.1';
const hotReloadRevision = '4c5454963ec4cbe847302d3063ada4b4204d7e95';

// Hashes of the published assets at the pinned upstream revision.
const hotReloadAssets = [
  {
    sourceFilename: 'main.cjs',
    installedFilename: 'main.js',
    sha256: 'f7faa4723537881ff7e5eef23ff3419300dcbbca49768d834bceeeb53f821201',
  },
  {
    sourceFilename: 'manifest.json',
    installedFilename: 'manifest.json',
    sha256: '62bab306528e1ba54382417f1cb6b78ae1e4e9a00e3169b812818949273d32f8',
  },
  {
    sourceFilename: 'LICENSE',
    installedFilename: 'LICENSE',
    sha256: '73c94d2a3e9cbe0661f3303aeb00d9d30fe628f13133a917d9baca775845bac1',
  },
];

async function readVerifiedAsset(sourceDirectory, asset) {
  const sourcePath = path.join(sourceDirectory, asset.sourceFilename);
  const content = await readFile(sourcePath);
  const actualHash = createHash('sha256').update(content).digest('hex');

  if (actualHash !== asset.sha256) {
    throw new Error(
      `Bundled Hot Reload ${hotReloadVersion} failed SHA-256 verification: ${sourcePath}. Restore the vendored file from Git and rerun npm run test:manual.`,
    );
  }

  return { filename: asset.installedFilename, content };
}

export async function installHotReload({ projectDirectory, pluginDirectory }) {
  const sourceDirectory = path.join(
    projectDirectory,
    'manual-test/vendor/hot-reload',
  );

  const verificationPromises = hotReloadAssets.map((asset) =>
    readVerifiedAsset(sourceDirectory, asset),
  );

  const verifiedAssets = await Promise.all(verificationPromises);

  await mkdir(pluginDirectory, { recursive: true });

  for (const asset of verifiedAssets) {
    await writeFile(path.join(pluginDirectory, asset.filename), asset.content);
  }

  return {
    id: 'hot-reload',
    version: hotReloadVersion,
    revision: hotReloadRevision,
    pluginDirectory,
  };
}
