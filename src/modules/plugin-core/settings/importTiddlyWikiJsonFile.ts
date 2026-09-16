import * as path from 'path';
import { App } from 'obsidian';
import { Notice } from 'obsidian';
import { readFilePathToJSON } from '@/modules/file-manipulation/readFilePathToJSON';
import { readFileObjectToJSON } from '@/modules/file-manipulation/readFileObjectToJSON';
import { convertTiddlersToObsidianNotes } from '@/modules/format-converters/convertTiddlersToObsidianNotes';
import { writeObsidianNotesToDirectory } from '@/modules/obsidian/writeObsidianNotesToDirectory';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';
import { parseTiddlyWikiJson } from '@/modules/conversion-core/codecs/tiddlywiki/parseTiddlyWikiJson';
import { getImportPath } from '@/modules/plugin-core/settings/getImportPath';
import { isAttachmentTiddler } from '@/modules/plugin-core/settings/isAttachmentTiddler';
import { writeMediaTiddlers } from '@/modules/plugin-core/settings/writeMediaTiddlers';

async function importTiddlers(app: App, tiddlers: Tiddler[]): Promise<void> {
  const importPath = getImportPath(app);
  const importFolderPath = path.basename(importPath);
  const validation = parseTiddlyWikiJson(JSON.stringify(tiddlers));

  if (!validation.value) {
    throw new Error(
      validation.diagnostics.map((diagnostic) => diagnostic.message).join('\n'),
    );
  }

  const validatedTiddlers = validation.value;

  const textTiddlers = validatedTiddlers.filter(
    (tiddler) => !isAttachmentTiddler(tiddler),
  );

  const conversionWarnings: string[] = [];
  const omittedSources: string[] = [];

  const obsidianNotes = convertTiddlersToObsidianNotes(
    textTiddlers,
    validatedTiddlers,
    (title, diagnostic) => {
      if (diagnostic.severity === 'warning') {
        const detail = `${title}: ${diagnostic.code} — ${diagnostic.message}`;

        conversionWarnings.push(detail);

        if (diagnostic.code === 'OMITTED_SOURCE') {
          omittedSources.push(detail);
        }
      }
    },
  );

  await app.vault.createFolder(importFolderPath);

  try {
    await writeMediaTiddlers(validatedTiddlers, importPath);

    await writeObsidianNotesToDirectory(
      app.vault,
      obsidianNotes,
      importFolderPath,
    );
  } catch (error) {
    try {
      const importFolder = app.vault.getAbstractFileByPath(importFolderPath);

      if (importFolder) {
        await app.vault.delete(importFolder, true);
      } else {
        await app.vault.adapter.rmdir(importFolderPath, true);
      }
    } catch (cleanupError) {
      throw new Error(
        `Import failed and could not remove ${importFolderPath}: ${String(cleanupError)}. Original error: ${String(error)}`,
      );
    }

    throw error;
  }

  if (conversionWarnings.length === 0) {
    new Notice(`✅ Successfully imported TiddlyWiki to ${importPath}`, 10000);

    return;
  }

  const reportedWarnings =
    omittedSources.length > 0 ? omittedSources : conversionWarnings;

  const warningKind =
    omittedSources.length > 0 ? 'omitted source region' : 'conversion warning';

  const visibleWarnings = reportedWarnings.slice(0, 5);

  const remainingWarningCount =
    reportedWarnings.length - visibleWarnings.length;

  const remainingWarningText = remainingWarningCount
    ? `\n… and ${remainingWarningCount} more; see the developer console.`
    : '';

  console.warn('TiddlyWiki import conversion warnings:', conversionWarnings);

  new Notice(
    `⚠️ Imported TiddlyWiki to ${importPath} with ${reportedWarnings.length} ${warningKind}${reportedWarnings.length === 1 ? '' : 's'}:\n${visibleWarnings.join('\n')}${remainingWarningText}\nKeep the source JSON for unsupported content.`,
    15000,
  );
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
