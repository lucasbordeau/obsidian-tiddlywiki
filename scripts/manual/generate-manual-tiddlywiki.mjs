import {
  copyFile,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TiddlyWiki } from 'tiddlywiki';
import { buildManualWikis } from './build-manual-wikis.mjs';

const require = createRequire(import.meta.url);
const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const manualTestDirectory = path.join(projectDirectory, 'manual-test');

const tiddlyWikiDirectory = path.dirname(
  require.resolve('tiddlywiki/package.json'),
);

const temporaryDirectory = await mkdtemp(
  path.join(os.tmpdir(), 'obsidian-tiddlywiki-fixtures-'),
);

async function generateOfficialIntroduction() {
  const slidesDirectory = path.join(
    tiddlyWikiDirectory,
    'editions',
    'introduction',
    'tiddlers',
    'slides',
  );

  const slideEntries = await readdir(slidesDirectory, { withFileTypes: true });

  const slideFilenames = slideEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tid'))
    .map((entry) => entry.name)
    .sort();

  const runtime = TiddlyWiki();

  runtime.boot.argv = [path.join(tiddlyWikiDirectory, 'editions', 'empty')];
  runtime.boot.disabledStartupModules = ['commands'];

  await new Promise((resolve) => runtime.boot.boot(resolve));

  const introductionTiddlers = [];

  for (const slideFilename of slideFilenames) {
    const slidePath = path.join(slidesDirectory, slideFilename);
    const slideSource = await readFile(slidePath, 'utf8');

    const parsedTiddlers = runtime.wiki.deserializeTiddlers(
      'application/x-tiddler',
      slideSource,
    );

    const hasOneNamedTiddler =
      parsedTiddlers.length === 1 && Boolean(parsedTiddlers[0].title);

    if (!hasOneNamedTiddler) {
      throw new Error(`Expected one titled tiddler in ${slidePath}`);
    }

    introductionTiddlers.push(parsedTiddlers[0]);
  }

  const introductionPath = path.join(
    manualTestDirectory,
    'tiddlywiki',
    'official-introduction.json',
  );

  await writeFile(
    introductionPath,
    `${JSON.stringify(introductionTiddlers, null, 2)}\n`,
  );

  return introductionTiddlers.length;
}

try {
  const wikiSummary = await buildManualWikis({
    outputDirectory: temporaryDirectory,
    fixturesDirectory: manualTestDirectory,
    mediaDirectory: path.join(manualTestDirectory, 'obsidian-vault'),
  });

  const importDestinationPath = path.join(
    manualTestDirectory,
    'tiddlywiki',
    'import.json',
  );

  const sourceWikiDestinationPath = path.join(
    manualTestDirectory,
    'tiddlywiki',
    'source.html',
  );

  const fixtureCopyPromises = [
    copyFile(wikiSummary.importJsonPath, importDestinationPath),
    copyFile(wikiSummary.sourceWikiPath, sourceWikiDestinationPath),
  ];

  await Promise.all(fixtureCopyPromises);

  const introductionTiddlerCount = await generateOfficialIntroduction();

  console.log('Updated manual-test/tiddlywiki/import.json.');
  console.log('Updated the self-contained manual-test/tiddlywiki/source.html.');

  console.log(
    `Updated official-introduction.json with ${introductionTiddlerCount} BSD-licensed tiddlers.`,
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
