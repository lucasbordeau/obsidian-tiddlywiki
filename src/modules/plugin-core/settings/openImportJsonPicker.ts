import { remote } from 'electron';
import { App } from 'obsidian';
import { importTiddlyWikiJsonPath } from '@/modules/plugin-core/settings/importTiddlyWikiJsonFile';

type OpenDialogResult = {
  canceled: boolean;
  filePaths: string[];
};

type NativeDialog = {
  showOpenDialog: (options: {
    title: string;
    defaultPath?: string;
    filters: { name: string; extensions: string[] }[];
    properties: string[];
  }) => Promise<OpenDialogResult>;
};

type ElectronRemote = {
  dialog: NativeDialog;
};

function getElectronRemote(): ElectronRemote {
  const electronRemote = remote as ElectronRemote | undefined;

  if (!electronRemote?.dialog) {
    throw new Error('Obsidian did not expose its native file picker.');
  }

  return electronRemote;
}

export async function openImportJsonPicker(app: App): Promise<void> {
  const electronRemote = getElectronRemote();

  const dialogOptions = {
    title: 'Import TiddlyWiki JSON',
    filters: [{ name: 'TiddlyWiki JSON', extensions: ['json'] }],
    properties: ['openFile'],
  };

  const selection = await electronRemote.dialog.showOpenDialog(dialogOptions);
  const selectedPath = selection.filePaths[0];
  const hasSelectedPath = !selection.canceled && Boolean(selectedPath);

  if (!hasSelectedPath) {
    return;
  }

  await importTiddlyWikiJsonPath(app, selectedPath);
}
