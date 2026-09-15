import * as fs from 'fs';
import type { App } from 'obsidian';
import { Notice } from 'obsidian';
import { readFilePathToJSON } from '../../file-manipulation/readFilePathToJSON';
import { readFileObjectToJSON } from '../../file-manipulation/readFileObjectToJSON';
import { convertTiddlersToObsidianNotes } from '../../format-converters/convertTiddlersToObsidianNotes';
import { writeObsidianNotesToDirectory } from '../../obsidian/writeObsidianNotesToDirectory';
import type { Tiddler } from '../../tiddlywiki/Tiddler';
import { getImportPath } from './getImportPath';
import { writeMediaTiddlers } from './writeMediaTiddlers';

async function importTiddlers(app: App, tiddlers: Tiddler[]): Promise<void> {
  const importPath = getImportPath(app);

  fs.mkdirSync(importPath, { recursive: true });

  await writeMediaTiddlers(tiddlers, importPath);

  const textTiddlers = tiddlers.filter(
    (tiddler) => !('type' in tiddler) || tiddler.type?.contains('text'),
  );

  const obsidianNotes = convertTiddlersToObsidianNotes(textTiddlers);

  writeObsidianNotesToDirectory(obsidianNotes, importPath);

  new Notice(`✅ Successfuly imported TiddlyWiki to ${importPath}`, 10000);
}

export async function importTiddlyWikiJsonFile(
  app: App,
  file: File,
): Promise<void> {
  const tiddlers: Tiddler[] = await readFileObjectToJSON(file);

  await importTiddlers(app, tiddlers);
}

export async function importTiddlyWikiJsonPath(
  app: App,
  filePath: string,
): Promise<void> {
  const tiddlers: Tiddler[] = await readFilePathToJSON(filePath);

  await importTiddlers(app, tiddlers);
}
