import * as path from 'path';
import { App } from 'obsidian';
import { convertMediaFileToBase64Object } from '@/modules/file-manipulation/convertMediaFileToBase64Object';
import { MediaFile } from '@/modules/file-manipulation/MediaFile';
import { convertObsidianNoteToTiddler } from '@/modules/format-converters/convertObsidianNoteToTiddler';
import { getMimeTypeFromFilePath } from '@/modules/file-manipulation/getMimeTypeFromFilePath';
import { PreparedExport } from '@/modules/export-selection/PreparedExport';
import { replaceLinksOutsideExportScope } from '@/modules/export-selection/replaceLinksOutsideExportScope';
import { ScopedExportNote } from '@/modules/export-selection/ScopedExportNote';
import { getVaultDirectory } from '@/modules/plugin-core/settings/getVaultDirectory';
import { convertBase64ObjectToTiddler } from '@/modules/tiddlywiki/convertBase64ObjectToTiddler';

export async function prepareExport(
  app: App,
  selectedExportFilePaths: ReadonlySet<string>,
): Promise<PreparedExport> {
  const selectedVaultFiles = app.vault
    .getFiles()
    .filter((vaultFile) => selectedExportFilePaths.has(vaultFile.path));

  const selectedMarkdownFiles = selectedVaultFiles.filter(
    (vaultFile) => vaultFile.extension === 'md',
  );

  const selectedMediaFiles = selectedVaultFiles.filter(
    (vaultFile) => vaultFile.extension !== 'md',
  );

  const noteReadPromises = selectedMarkdownFiles.map(
    async (markdownFile): Promise<ScopedExportNote> => ({
      title: markdownFile.basename,
      content: await app.vault.cachedRead(markdownFile),
      path: markdownFile.path,
    }),
  );

  const scopedExportNotes = await Promise.all(noteReadPromises);
  let brokenLinkCount = 0;

  const noteTiddlers = scopedExportNotes.map((scopedExportNote) => {
    const linkReplacement = replaceLinksOutsideExportScope(
      scopedExportNote.content,
      scopedExportNote.path,
      selectedExportFilePaths,
      (linkPath, sourcePath) =>
        app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath)?.path ??
        null,
    );

    brokenLinkCount += linkReplacement.brokenLinkCount;

    return convertObsidianNoteToTiddler({
      title: scopedExportNote.title,
      content: linkReplacement.content,
    });
  });

  const vaultDirectory = getVaultDirectory(app);

  const selectedMediaRecords: MediaFile[] = selectedMediaFiles.map(
    (mediaFile) => ({
      extension: path.extname(mediaFile.path),
      filePath: path.join(vaultDirectory, mediaFile.path),
      mimeType: getMimeTypeFromFilePath(mediaFile.path),
      creationDate: new Date(mediaFile.stat.ctime),
      lastModifiedDate: new Date(mediaFile.stat.mtime),
    }),
  );

  const mediaTiddlers = selectedMediaRecords
    .map(convertMediaFileToBase64Object)
    .map(convertBase64ObjectToTiddler);

  return {
    tiddlers: [...noteTiddlers, ...mediaTiddlers],
    brokenLinkCount,
  };
}
