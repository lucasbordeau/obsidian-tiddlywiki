import * as fs from 'fs';
import { App } from 'obsidian';
import { Notice } from 'obsidian';
import { readFilePathToJSON } from '@/modules/file-manipulation/readFilePathToJSON';
import { readFileObjectToJSON } from '@/modules/file-manipulation/readFileObjectToJSON';
import { convertTiddlersToObsidianNotes } from '@/modules/format-converters/convertTiddlersToObsidianNotes';
import { writeObsidianNotesToDirectory } from '@/modules/obsidian/writeObsidianNotesToDirectory';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';
import { getImportPath } from '@/modules/plugin-core/settings/getImportPath';
import { writeMediaTiddlers } from '@/modules/plugin-core/settings/writeMediaTiddlers';

async function importTiddlers(app: App, tiddlers: Tiddler[]): Promise<void> {
  const importPath = getImportPath(app);

  fs.mkdirSync(importPath, { recursive: true });

  await writeMediaTiddlers(tiddlers, importPath);

  const textTiddlers = tiddlers.filter(
    (tiddler) => !tiddler.type || tiddler.type.includes('text'),
  );

  const obsidianNotes = convertTiddlersToObsidianNotes(textTiddlers, tiddlers);

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
