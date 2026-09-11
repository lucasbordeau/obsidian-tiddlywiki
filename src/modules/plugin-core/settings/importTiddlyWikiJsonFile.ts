import * as fs from 'fs';
import type { App } from 'obsidian';
import { Notice } from 'obsidian';
import { readFileObjectToJSON } from '../../file-manipulation/readFileObjectToJSON';
import { convertTiddlersToObsidianNotes } from '../../format-converters/convertTiddlersToObsidianNotes';
import { writeObsidianNotesToDirectory } from '../../obsidian/writeObsidianNotesToDirectory';
import type { Tiddler } from '../../tiddlywiki/Tiddler';
import { getImportPath } from './getImportPath';
import { writeMediaTiddlers } from './writeMediaTiddlers';

export async function importTiddlyWikiJsonFile(
  app: App,
  file: File,
): Promise<void> {
  const importPath = getImportPath(app);

  fs.mkdirSync(importPath, { recursive: true });

  const tiddlers: Tiddler[] = await readFileObjectToJSON(file);

  await writeMediaTiddlers(tiddlers, importPath);

  const textTiddlers = tiddlers.filter(
    (tiddler) => !('type' in tiddler) || tiddler.type?.contains('text'),
  );

  const obsidianNotes = convertTiddlersToObsidianNotes(textTiddlers);

  writeObsidianNotesToDirectory(obsidianNotes, importPath);

  new Notice(`✅ Successfuly imported TiddlyWiki to ${importPath}`, 10000);
}
