import assert from 'node:assert/strict';
import {
  access,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { TiddlyWiki } from 'tiddlywiki';
import { prepareManualTest } from './prepare-manual-test.mjs';

const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const runtimePackagePath = require.resolve('tiddlywiki/package.json');
const noteSuffixes = ['Formatting', 'Links-and-media', 'Preservation', 'Start'];

const expectedWikiTitles = [
  ...noteSuffixes.map((suffix) => `TW-${suffix}`),
  'TW-audio.mp3',
  'TW-image.jpg',
].sort();

async function bootVerificationWiki() {
  const runtime = TiddlyWiki();
  const runtimeDirectory = path.dirname(runtimePackagePath);

  runtime.boot.argv = [path.join(runtimeDirectory, 'editions', 'empty')];
  runtime.boot.disabledStartupModules = ['commands'];

  await new Promise((resolve) => runtime.boot.boot(resolve));

  return runtime;
}

async function assertFilesMatch(actualPath, expectedPath) {
  const [actualContent, expectedContent] = await Promise.all([
    readFile(actualPath),
    readFile(expectedPath),
  ]);

  assert.deepEqual(actualContent, expectedContent, actualPath);
}

async function assertVaultReady(vaultDirectory) {
  const pluginDirectory = path.join(
    vaultDirectory,
    '.obsidian/plugins/tiddlywiki-import-export',
  );

  for (const pluginFilename of ['main.js', 'manifest.json']) {
    await assertFilesMatch(
      path.join(pluginDirectory, pluginFilename),
      path.join(projectDirectory, pluginFilename),
    );
  }

  const pluginConfiguration = await readFile(
    path.join(vaultDirectory, '.obsidian/community-plugins.json'),
    'utf8',
  );

  assert.deepEqual(JSON.parse(pluginConfiguration), [
    'hot-reload',
    'tiddlywiki-import-export',
  ]);

  assert.deepEqual((await readdir(pluginDirectory)).sort(), [
    '.hotreload',
    'main.js',
    'manifest.json',
  ]);

  assert.equal(
    await readFile(path.join(pluginDirectory, '.hotreload'), 'utf8'),
    '',
  );

  const hotReloadDirectory = path.join(
    vaultDirectory,
    '.obsidian/plugins/hot-reload',
  );

  const hotReloadAssets = [
    ['main.js', 'main.cjs'],
    ['manifest.json', 'manifest.json'],
    ['LICENSE', 'LICENSE'],
  ];

  for (const [installedFilename, sourceFilename] of hotReloadAssets) {
    await assertFilesMatch(
      path.join(hotReloadDirectory, installedFilename),
      path.join(
        projectDirectory,
        'manual-test/vendor/hot-reload',
        sourceFilename,
      ),
    );
  }

  const settingsPath = path.join(vaultDirectory, '.obsidian/app.json');
  const vaultSettings = JSON.parse(await readFile(settingsPath, 'utf8'));
  const vaultFilenames = await readdir(vaultDirectory);

  const installedNoteNames = vaultFilenames
    .filter((filename) => filename.endsWith('.md'))
    .sort();

  const expectedNoteNames = [
    ...noteSuffixes.map((suffix) => `OB-${suffix}.md`),
    'MANUAL-TEST.md',
  ].sort();

  assert.equal(
    vaultSettings.safeMode,
    false,
    'Community plugins must be enabled in the mock vault',
  );

  assert.deepEqual(installedNoteNames, expectedNoteNames);

  for (const suffix of noteSuffixes) {
    const filename = `OB-${suffix}.md`;
    const installedNotePath = path.join(vaultDirectory, filename);

    await assertFilesMatch(
      installedNotePath,
      path.join(projectDirectory, 'manual-test/obsidian-vault', filename),
    );

    const noteSource = await readFile(installedNotePath, 'utf8');
    const localLinks = noteSource.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g);

    for (const localLink of localLinks) {
      const linkTitle = localLink[1];
      const filename = path.extname(linkTitle) ? linkTitle : `${linkTitle}.md`;

      await access(path.join(vaultDirectory, filename));
    }
  }

  await assertFilesMatch(
    path.join(vaultDirectory, 'OB-image.jpg'),
    path.join(projectDirectory, 'manual-test/obsidian-vault/OB-image.jpg'),
  );

  await assertFilesMatch(
    path.join(vaultDirectory, 'OB-audio.mp3'),
    path.join(projectDirectory, 'manual-test/obsidian-vault/OB-audio.mp3'),
  );

  await assertFilesMatch(
    path.join(vaultDirectory, 'MANUAL-TEST.md'),
    path.join(projectDirectory, 'manual-test/obsidian-vault/MANUAL-TEST.md'),
  );

  await assert.rejects(access(path.join(vaultDirectory, 'tiddlywiki')), {
    code: 'ENOENT',
  });
}

async function assertProfileReady(session) {
  const profilePath = path.join(session.profileDirectory, 'obsidian.json');
  const profile = JSON.parse(await readFile(profilePath, 'utf8'));
  const registeredVaults = Object.entries(profile.vaults);

  assert.equal(
    session.profileDirectory,
    path.join(session.runDirectory, 'profile'),
  );

  assert.equal(
    registeredVaults.length,
    1,
    'The isolated profile must register exactly one mock vault',
  );

  const [vaultId, registeredVault] = registeredVaults[0];

  assert.ok(vaultId, 'The registered mock vault needs an ID');
  assert.equal(registeredVault.path, session.vaultDirectory);

  assert.equal(
    registeredVault.open,
    true,
    'The mock vault must open on launch',
  );

  const workspacePath = path.join(
    session.vaultDirectory,
    '.obsidian/workspace.json',
  );

  const workspace = JSON.parse(await readFile(workspacePath, 'utf8'));
  const pendingNodes = [workspace.main];
  let activeLeaf;

  while (pendingNodes.length > 0) {
    const workspaceNode = pendingNodes.pop();

    if (workspaceNode.id === workspace.active) {
      activeLeaf = workspaceNode;
    }

    pendingNodes.push(...(workspaceNode.children ?? []));
  }

  assert.ok(
    activeLeaf,
    'The active instruction note must be in the main workspace',
  );

  assert.equal(activeLeaf.type, 'leaf');
  assert.equal(activeLeaf.state.type, 'markdown');
  assert.equal(activeLeaf.state.state.file, 'MANUAL-TEST.md');
  assert.equal(activeLeaf.state.state.mode, 'preview');

  return vaultId;
}

async function assertWikiArtifactsReady(runDirectory) {
  const runtime = await bootVerificationWiki();
  const wikiDirectory = path.join(runDirectory, 'tiddlywiki');
  const exportPath = path.join(wikiDirectory, 'import.json');
  const exportSource = await readFile(exportPath, 'utf8');
  const exportedTiddlers = JSON.parse(exportSource);

  for (const suffix of noteSuffixes) {
    const filename = `TW-${suffix}.tid`;

    await assertFilesMatch(
      path.join(wikiDirectory, filename),
      path.join(projectDirectory, 'manual-test/tiddlywiki', filename),
    );
  }

  const exportedTitles = exportedTiddlers
    .map((tiddler) => tiddler.title)
    .sort();

  assert.deepEqual(exportedTitles, expectedWikiTitles);
  assert.equal(new Set(exportedTitles).size, exportedTitles.length);

  const importedTiddlers = runtime.wiki.deserializeTiddlers(
    'application/json',
    exportSource,
  );

  runtime.wiki.addTiddlers(importedTiddlers);

  const formattingHtml = runtime.wiki.renderTiddler(
    'text/html',
    'TW-Formatting',
  );

  const mediaHtml = runtime.wiki.renderTiddler(
    'text/html',
    'TW-Links-and-media',
  );

  const preservationHtml = runtime.wiki.renderTiddler(
    'text/html',
    'TW-Preservation',
  );

  assert.match(formattingHtml, /<strong>Bold<\/strong>/);
  assert.match(formattingHtml, /<table>/);
  assert.match(mediaHtml, /data:image\/jpeg;base64,/);
  assert.match(mediaHtml, /<audio\b/);
  assert.match(mediaHtml, /data:audio\/mpeg;base64,/);
  assert.match(preservationHtml, /TW-MACRO-KEEP/);

  assert.equal(
    runtime.wiki.getTiddler('TW-Start').fields['manual-origin'],
    'tiddlywiki',
  );

  for (const suffix of noteSuffixes) {
    const linkedTitles = runtime.wiki.getTiddlerLinks(`TW-${suffix}`);

    for (const linkedTitle of linkedTitles) {
      assert.ok(runtime.wiki.tiddlerExists(linkedTitle), linkedTitle);
    }
  }

  const mediaFixtures = [
    { title: 'TW-image.jpg', filename: 'OB-image.jpg', type: 'image/jpeg' },
    { title: 'TW-audio.mp3', filename: 'OB-audio.mp3', type: 'audio/mpeg' },
  ];

  for (const mediaFixture of mediaFixtures) {
    const mediaTiddler = runtime.wiki.getTiddler(mediaFixture.title);

    const sourceBytes = await readFile(
      path.join(
        projectDirectory,
        'manual-test/obsidian-vault',
        mediaFixture.filename,
      ),
    );

    assert.equal(mediaTiddler.fields.type, mediaFixture.type);

    assert.deepEqual(
      Buffer.from(mediaTiddler.fields.text, 'base64'),
      sourceBytes,
    );
  }

  const sourceHtml = await readFile(
    path.join(wikiDirectory, 'source.html'),
    'utf8',
  );

  const emptyHtml = await readFile(
    path.join(wikiDirectory, 'empty.html'),
    'utf8',
  );

  const runtimePackage = JSON.parse(await readFile(runtimePackagePath, 'utf8'));
  const versionMeta = `<meta name="tiddlywiki-version" content="${runtimePackage.version}"`;

  assert.ok(sourceHtml.includes(versionMeta));
  assert.ok(emptyHtml.includes(versionMeta));

  const sourceTiddlers = Array.from(
    runtime.wiki.deserializeTiddlers('text/html', sourceHtml),
  );

  const emptyTiddlers = Array.from(
    runtime.wiki.deserializeTiddlers('text/html', emptyHtml),
  );

  const ordinarySourceTiddlers = sourceTiddlers.filter(
    (tiddler) => !tiddler.title.startsWith('$:/'),
  );

  const ordinarySourceTitles = ordinarySourceTiddlers
    .map((tiddler) => tiddler.title)
    .sort();

  const ordinaryEmptyTiddlers = emptyTiddlers.filter(
    (tiddler) => !tiddler.title.startsWith('$:/'),
  );

  assert.deepEqual(ordinarySourceTitles, expectedWikiTitles);
  assert.deepEqual(ordinaryEmptyTiddlers, []);

  for (const exportedTiddler of exportedTiddlers) {
    const savedTiddler = sourceTiddlers.find(
      (tiddler) => tiddler.title === exportedTiddler.title,
    );

    assert.equal(
      savedTiddler.text,
      exportedTiddler.text,
      exportedTiddler.title,
    );

    assert.equal(
      savedTiddler.type,
      exportedTiddler.type,
      exportedTiddler.title,
    );
  }
}

async function assertGuideReady(guidePath, vaultDirectory) {
  const guideMarkdown = await readFile(guidePath, 'utf8');
  const guideDirectory = path.dirname(guidePath);

  const relativeArtifactPaths = [
    '../tiddlywiki/import.json',
    '../tiddlywiki/source.html',
    '../tiddlywiki/empty.html',
  ];

  for (const relativeArtifactPath of relativeArtifactPaths) {
    assert.ok(
      guideMarkdown.includes(`\`${relativeArtifactPath}\``),
      `Missing relative artifact path: ${relativeArtifactPath}`,
    );

    assert.equal(path.isAbsolute(relativeArtifactPath), false);

    const localPath = path.resolve(guideDirectory, relativeArtifactPath);
    const pathFromVault = path.relative(vaultDirectory, localPath);
    const isOutsideVault = pathFromVault.startsWith(`..${path.sep}`);

    assert.equal(
      isOutsideVault,
      true,
      'Generated artifacts stay outside vault',
    );

    await access(localPath);
  }

  assert.match(guideMarkdown, /^# Manual test: Obsidian/);

  assert.doesNotMatch(
    guideMarkdown,
    /\{\{\w+\}\}/,
    'The versioned guide must not contain generated placeholders',
  );

  assert.doesNotMatch(guideMarkdown, /file:\/\//);
  assert.doesNotMatch(guideMarkdown, /(?:^|\s)(?:\/[\w.-]+)+\/?/m);
  assert.doesNotMatch(guideMarkdown, /[A-Za-z]:\\/);
  assert.doesNotMatch(guideMarkdown, /\]\(</);

  const obsoleteLauncherFilenames = ['index.html', 'guide.js', 'guide.css'];
  const runDirectory = path.dirname(vaultDirectory);

  for (const filename of obsoleteLauncherFilenames) {
    await assert.rejects(access(path.join(runDirectory, filename)), {
      code: 'ENOENT',
    });
  }
}

test('prepares real manual testing artifacts and preserves earlier test sessions', async (context) => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'obsidian-manual-setup & '),
  );

  try {
    context.mock.method(global, 'fetch', () => {
      throw new Error('Manual test setup must work without network requests.');
    });

    const firstSession = await prepareManualTest({
      projectDirectory,
      outputDirectory,
    });

    assert.equal(path.dirname(firstSession.runDirectory), outputDirectory);
    assert.match(path.basename(firstSession.runDirectory), /^run-/);

    assert.equal(
      firstSession.vaultDirectory,
      path.join(firstSession.runDirectory, 'obsidian-vault'),
    );

    assert.equal(
      firstSession.guidePath,
      path.join(firstSession.vaultDirectory, 'MANUAL-TEST.md'),
    );

    assert.equal(
      firstSession.pluginDirectory,
      path.join(
        firstSession.vaultDirectory,
        '.obsidian/plugins/tiddlywiki-import-export',
      ),
    );

    await context.test(
      'installs and enables the current plugin, Hot Reload, and self-contained Obsidian examples',
      async () => {
        await assertVaultReady(firstSession.vaultDirectory);
      },
    );

    let firstVaultId;

    await context.test(
      'opens the instruction note in the isolated mock vault profile',
      async () => {
        firstVaultId = await assertProfileReady(firstSession);
      },
    );

    await context.test(
      'packages the fixtures into working JSON and standalone TiddlyWiki files',
      async () => {
        await assertWikiArtifactsReady(firstSession.runDirectory);
      },
    );

    await context.test(
      'puts Markdown instructions and working relative paths in the mock vault',
      async () => {
        await assertGuideReady(
          firstSession.guidePath,
          firstSession.vaultDirectory,
        );
      },
    );

    await context.test(
      'creates a fresh session without removing manual edits',
      async () => {
        const editedNotePath = path.join(
          firstSession.vaultDirectory,
          'OB-Start.md',
        );

        const newNotePath = path.join(
          firstSession.vaultDirectory,
          'My manual result.md',
        );

        const editedWikiPath = path.join(
          firstSession.runDirectory,
          'tiddlywiki',
          'source.html',
        );

        await writeFile(
          editedNotePath,
          'Manual edit that must survive another setup.',
        );

        await writeFile(newNotePath, 'A contributor-created note.');
        await writeFile(editedWikiPath, 'A wiki saved during manual testing.');

        const secondSession = await prepareManualTest({
          projectDirectory,
          outputDirectory,
        });

        assert.notEqual(secondSession.runDirectory, firstSession.runDirectory);

        assert.equal(
          await readFile(editedNotePath, 'utf8'),
          'Manual edit that must survive another setup.',
        );

        assert.equal(
          await readFile(newNotePath, 'utf8'),
          'A contributor-created note.',
        );

        assert.equal(
          await readFile(editedWikiPath, 'utf8'),
          'A wiki saved during manual testing.',
        );

        await assertVaultReady(secondSession.vaultDirectory);

        const secondVaultId = await assertProfileReady(secondSession);

        assert.notEqual(
          secondSession.profileDirectory,
          firstSession.profileDirectory,
        );

        assert.notEqual(
          secondVaultId,
          firstVaultId,
          'Each mock vault must receive a fresh ID',
        );

        await assert.rejects(
          access(
            path.join(secondSession.vaultDirectory, 'My manual result.md'),
          ),
          { code: 'ENOENT' },
        );
      },
    );
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});
