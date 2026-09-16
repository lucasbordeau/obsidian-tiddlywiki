import { App } from 'obsidian';
import { prepareExport } from '@/modules/export-selection/prepareExport';
import { downloadExport } from '@/modules/plugin-core/settings/downloadExport';

function isVisibleVaultPath(vaultPath: string): boolean {
  const hasHiddenPathPart = vaultPath
    .split('/')
    .some((pathPart) => pathPart.startsWith('.'));

  return !hasHiddenPathPart;
}

export async function exportVaultToJson(app: App): Promise<void> {
  const visibleVaultFiles = app.vault
    .getFiles()
    .filter((vaultFile) => isVisibleVaultPath(vaultFile.path));

  const exportFilePaths = new Set(
    visibleVaultFiles.map((vaultFile) => vaultFile.path),
  );

  const preparedExport = await prepareExport(app, exportFilePaths);

  downloadExport(preparedExport.tiddlers, preparedExport.brokenLinkCount);
}
