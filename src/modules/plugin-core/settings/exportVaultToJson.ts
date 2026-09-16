import { App } from 'obsidian';
import { convertMediaFileToBase64Object } from '@/modules/file-manipulation/convertMediaFileToBase64Object';
import { convertObsidianNoteToTiddler } from '@/modules/format-converters/convertObsidianNoteToTiddler';
import { getAllObsidianNotesInDirectory } from '@/modules/obsidian/getAllObsidianNotesInDirectory';
import { getMediaFilesInObsidianDirectory } from '@/modules/obsidian/getMediaFilesInObsidianDirectory';
import { convertBase64ObjectToTiddler } from '@/modules/tiddlywiki/convertBase64ObjectToTiddler';
import { triggerDownloadModalForJSON } from '@/modules/plugin-core/settings/triggerDownloadModalForJSON';
import { getVaultDirectory } from '@/modules/plugin-core/settings/getVaultDirectory';

export async function exportVaultToJson(app: App): Promise<void> {
  const obsidianDirectoryToExport = getVaultDirectory(app);

  const obsidianNotes = getAllObsidianNotesInDirectory(
    obsidianDirectoryToExport,
  );

  const mediaFiles = await getMediaFilesInObsidianDirectory(
    obsidianDirectoryToExport,
  );

  const mediaTiddlers = mediaFiles
    .map(convertMediaFileToBase64Object)
    .map(convertBase64ObjectToTiddler);

  const tiddlers = obsidianNotes.map(convertObsidianNoteToTiddler);

  const tiddlersToExport = [...tiddlers, ...mediaTiddlers];

  triggerDownloadModalForJSON(tiddlersToExport, 'test.json');
}
