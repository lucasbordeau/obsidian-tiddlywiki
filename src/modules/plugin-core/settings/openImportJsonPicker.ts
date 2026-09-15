import { remote } from 'electron';
import type { App } from 'obsidian';
import { importTiddlyWikiJsonPath } from './importTiddlyWikiJsonFile';

const importPathArgumentPrefix = '--tiddlywiki-import-path=';

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
  process: { argv: string[] };
};

function getElectronRemote(): ElectronRemote {
  const electronRemote = remote as ElectronRemote | undefined;

  if (!electronRemote?.dialog || !electronRemote.process) {
    throw new Error('Obsidian did not expose its native file picker.');
  }

  return electronRemote;
}

export function getImportPathHint(
  applicationArguments: string[] = process.argv,
): string | undefined {
  const importPathArgument = applicationArguments.find((argument) =>
    argument.startsWith(importPathArgumentPrefix),
  );

  return importPathArgument?.slice(importPathArgumentPrefix.length);
}

export async function openImportJsonPicker(app: App): Promise<void> {
  const electronRemote = getElectronRemote();
  const defaultPath = getImportPathHint(electronRemote.process.argv);

  const dialogOptions = {
    title: 'Import TiddlyWiki JSON',
    filters: [{ name: 'TiddlyWiki JSON', extensions: ['json'] }],
    properties: ['openFile'],
  };

  if (defaultPath) {
    Object.assign(dialogOptions, { defaultPath });
  }

  const selection = await electronRemote.dialog.showOpenDialog(dialogOptions);
  const selectedPath = selection.filePaths[0];
  const hasSelectedPath = !selection.canceled && Boolean(selectedPath);

  if (!hasSelectedPath) {
    return;
  }

  await importTiddlyWikiJsonPath(app, selectedPath);
}
