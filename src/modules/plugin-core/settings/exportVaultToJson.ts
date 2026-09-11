import type { App } from 'obsidian';
import { convertMediaFileToBase64Object } from '../../file-manipulation/convertMediaFileToBase64Object';
import { convertObsidianNoteToTiddler } from '../../format-converters/convertObsidianNoteToTiddler';
import { getAllObsidianNotesInDirectory } from '../../obsidian/getAllObsidianNotesInDirectory';
import { getMediaFilesInDirectory } from '../../obsidian/getMediaFilesInObsidianDirectory';
import { convertBase64ObjectToTiddler } from '../../tiddlywiki/convertBase64ObjectToTiddler';
import { triggerDownloadModalForJSON } from './triggerDownloadModalForJSON';
import { getVaultDirectory } from './getVaultDirectory';

export async function exportVaultToJson(app: App): Promise<void> {
  const obsidianDirectoryToExport = getVaultDirectory(app);

  const obsidianNotes = getAllObsidianNotesInDirectory(
    obsidianDirectoryToExport,
  );

  const mediaFiles = await getMediaFilesInDirectory(obsidianDirectoryToExport);

  const mediaTiddlers = mediaFiles
    .map(convertMediaFileToBase64Object)
    .map(convertBase64ObjectToTiddler);

  const tiddlers = obsidianNotes.map(convertObsidianNoteToTiddler);

  const tiddlersToExport = [...tiddlers, ...mediaTiddlers];

  triggerDownloadModalForJSON(tiddlersToExport, 'test.json');
}
