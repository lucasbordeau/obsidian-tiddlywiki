import * as fs from 'fs';
import * as path from 'path';
import { Temporal } from '@js-temporal/polyfill';
import { lookup } from 'mime-types';
import { App } from 'obsidian';
import { convertMediaFileToBase64Object } from '@/modules/file-manipulation/convertMediaFileToBase64Object';
import { isTextualAttachmentContentType } from '@/modules/file-manipulation/isTextualAttachmentContentType';
import { MediaFile } from '@/modules/file-manipulation/MediaFile';
import { convertObsidianNoteToTiddler } from '@/modules/format-converters/convertObsidianNoteToTiddler';
import { PreparedExport } from '@/modules/export-selection/PreparedExport';
import { replaceLinksOutsideExportScope } from '@/modules/export-selection/replaceLinksOutsideExportScope';
import { ScopedExportNote } from '@/modules/export-selection/ScopedExportNote';
import { getVaultDirectory } from '@/modules/plugin-core/settings/getVaultDirectory';
import { convertBase64ObjectToTiddler } from '@/modules/tiddlywiki/convertBase64ObjectToTiddler';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

function getExportContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.canvas') {
    return 'application/json';
  }

  if (extension === '.base') {
    return 'text/plain';
  }

  return lookup(filePath) || 'application/octet-stream';
}

function convertTextDocumentFileToTiddler(mediaFile: MediaFile): Tiddler {
  return {
    title: path.basename(mediaFile.filePath),
    text: fs.readFileSync(mediaFile.filePath, 'utf8'),
    type: mediaFile.mimeType,
    created: mediaFile.creationDate.toString({ fractionalSecondDigits: 3 }),
    modified: mediaFile.lastModifiedDate.toString({
      fractionalSecondDigits: 3,
    }),
    tags: '',
  };
}

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
      creationTimeMs: markdownFile.stat.ctime,
      modificationTimeMs: markdownFile.stat.mtime,
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
      creationTimeMs: scopedExportNote.creationTimeMs,
      modificationTimeMs: scopedExportNote.modificationTimeMs,
    });
  });

  const vaultDirectory = getVaultDirectory(app);

  const selectedMediaRecords: MediaFile[] = selectedMediaFiles.map(
    (mediaFile) => ({
      extension: path.extname(mediaFile.path),
      filePath: path.join(vaultDirectory, mediaFile.path),
      mimeType: getExportContentType(mediaFile.path),
      creationDate: Temporal.Instant.fromEpochMilliseconds(
        Math.trunc(mediaFile.stat.ctime),
      ),
      lastModifiedDate: Temporal.Instant.fromEpochMilliseconds(
        Math.trunc(mediaFile.stat.mtime),
      ),
    }),
  );

  const mediaTiddlers = selectedMediaRecords.map((mediaFile) => {
    const isTextDocumentContainer = isTextualAttachmentContentType(
      mediaFile.mimeType,
      path.basename(mediaFile.filePath),
    );

    if (isTextDocumentContainer) {
      return convertTextDocumentFileToTiddler(mediaFile);
    }

    const base64Object = convertMediaFileToBase64Object(mediaFile);

    return convertBase64ObjectToTiddler(base64Object);
  });

  return {
    tiddlers: [...noteTiddlers, ...mediaTiddlers],
    brokenLinkCount,
  };
}
