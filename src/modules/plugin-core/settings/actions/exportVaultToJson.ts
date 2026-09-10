import type { App } from 'obsidian';
import { convertMediaFileToBase64Object } from '../../../file-manipulation/utils/convertMediaFileToBase64Object';
import { convertObsidianNoteToTiddler } from '../../../format-converters/convertObsidianNoteToTiddler';
import { getAllObsidianNotesInDirectory } from '../../../obsidian/utils/getAllObsidianNotesInDirectory';
import { getMediaFilesInDirectory } from '../../../obsidian/utils/getMediaFilesInObsidianDirectory';
import { convertBase64ObjectToTiddler } from '../../../tiddlywiki/utils/convertBase64ObjectToTiddler';
import { triggerDownloadModalForJSON } from '../downloads/triggerDownloadModalForJSON';
import { getVaultDirectory } from '../paths/getVaultDirectory';

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
