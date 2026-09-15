import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { TiddlyWiki } from 'tiddlywiki';

const require = createRequire(import.meta.url);

const runtimeDirectory = path.dirname(
  require.resolve('tiddlywiki/package.json'),
);

async function bootManualWiki() {
  const runtime = TiddlyWiki();

  runtime.boot.argv = [path.join(runtimeDirectory, 'editions', 'empty')];
  runtime.boot.disabledStartupModules = ['commands'];

  await new Promise((resolve) => runtime.boot.boot(resolve));

  return runtime;
}

async function readFixtureTiddlers(runtime, fixturesDirectory) {
  const tiddlersDirectory = path.join(fixturesDirectory, 'tiddlywiki');

  const fixtureEntries = await readdir(tiddlersDirectory, {
    withFileTypes: true,
  });

  const tiddlerFiles = fixtureEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tid'))
    .map((entry) => entry.name)
    .sort();

  if (tiddlerFiles.length === 0) {
    throw new Error(
      `No manual TiddlyWiki fixtures found in ${tiddlersDirectory}`,
    );
  }

  const fixtureTiddlers = [];

  for (const filename of tiddlerFiles) {
    const fixturePath = path.join(tiddlersDirectory, filename);
    const source = await readFile(fixturePath, 'utf8');

    const parsedTiddlers = runtime.wiki.deserializeTiddlers(
      'application/x-tiddler',
      source,
    );

    const hasOneNamedTiddler =
      parsedTiddlers.length === 1 && Boolean(parsedTiddlers[0].title);

    if (!hasOneNamedTiddler) {
      throw new Error(`Expected one titled tiddler in ${fixturePath}`);
    }

    fixtureTiddlers.push(parsedTiddlers[0]);
  }

  return fixtureTiddlers;
}

async function readMediaTiddlers(mediaDirectory) {
  const mediaFixtures = [
    { filename: 'OB-image.jpg', title: 'TW-image.jpg', type: 'image/jpeg' },
    { filename: 'OB-audio.mp3', title: 'TW-audio.mp3', type: 'audio/mpeg' },
  ];

  const mediaTiddlerPromises = mediaFixtures.map(async (fixture) => {
    const content = await readFile(path.join(mediaDirectory, fixture.filename));

    return {
      title: fixture.title,
      type: fixture.type,
      text: content.toString('base64'),
    };
  });

  return Promise.all(mediaTiddlerPromises);
}

function validateFixtureTitles(fixtureTiddlers) {
  const seenTitles = new Set();

  for (const tiddler of fixtureTiddlers) {
    if (tiddler.title.startsWith('$:/')) {
      throw new Error(
        `Manual fixture title must not be a system title: ${tiddler.title}`,
      );
    }

    if (seenTitles.has(tiddler.title)) {
      throw new Error(`Duplicate manual fixture title: ${tiddler.title}`);
    }

    seenTitles.add(tiddler.title);
  }
}

function configureManualWiki(runtime, title, defaultTitles) {
  const configurationTiddlers = [
    { title: '$:/SiteTitle', text: title },
    { title: '$:/SiteSubtitle', text: 'Obsidian ↔ TiddlyWiki manual testing' },
    {
      title: '$:/DefaultTiddlers',
      text: runtime.utils.stringifyList(defaultTitles),
    },
    { title: '$:/StoryList', list: defaultTitles },
  ];

  runtime.wiki.addTiddlers(configurationTiddlers);
}

export async function buildManualWikis({
  outputDirectory,
  fixturesDirectory,
  mediaDirectory,
}) {
  const runtime = await bootManualWiki();
  const noteTiddlers = await readFixtureTiddlers(runtime, fixturesDirectory);
  const mediaTiddlers = await readMediaTiddlers(mediaDirectory);
  const fixtureTiddlers = [...noteTiddlers, ...mediaTiddlers];

  validateFixtureTitles(fixtureTiddlers);

  const sourceWikiPath = path.join(outputDirectory, 'source.html');
  const emptyWikiPath = path.join(outputDirectory, 'empty.html');
  const importJsonPath = path.join(outputDirectory, 'import.json');

  await mkdir(outputDirectory, { recursive: true });

  configureManualWiki(runtime, 'Manual testing — import target', []);

  const emptyWikiHtml = runtime.wiki.renderTiddler(
    'text/plain',
    '$:/core/save/all',
  );

  await writeFile(emptyWikiPath, emptyWikiHtml);

  const defaultTitles = noteTiddlers.map((tiddler) => tiddler.title);
  const startTitleIndex = defaultTitles.indexOf('TW-Start');

  if (startTitleIndex > 0) {
    defaultTitles.splice(startTitleIndex, 1);
    defaultTitles.unshift('TW-Start');
  }

  runtime.wiki.addTiddlers(fixtureTiddlers);

  configureManualWiki(
    runtime,
    'Manual testing — TiddlyWiki source',
    defaultTitles,
  );

  const sourceWikiHtml = runtime.wiki.renderTiddler(
    'text/plain',
    '$:/core/save/all',
  );

  await writeFile(sourceWikiPath, sourceWikiHtml);

  await writeFile(
    importJsonPath,
    `${JSON.stringify(fixtureTiddlers, null, 2)}\n`,
  );

  return {
    sourceWikiPath,
    emptyWikiPath,
    importJsonPath,
    noteCount: noteTiddlers.length,
    mediaCount: mediaTiddlers.length,
    tiddlerCount: fixtureTiddlers.length,
    tiddlyWikiVersion: runtime.packageInfo.version,
  };
}
