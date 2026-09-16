import { App } from 'obsidian';
import { buildExportTreeNodes } from '@/modules/export-selection/buildExportTreeNodes';
import { getExportFilePaths } from '@/modules/export-selection/getExportFilePaths';
import { prepareExport } from '@/modules/export-selection/prepareExport';
import { downloadExport } from '@/modules/plugin-core/settings/downloadExport';

export async function exportVaultToJson(app: App): Promise<void> {
  const exportTreeNodes = buildExportTreeNodes(app.vault.getRoot().children);

  const selectedExportFilePaths = new Set(
    exportTreeNodes.flatMap(getExportFilePaths),
  );

  const preparedExport = await prepareExport(app, selectedExportFilePaths);

  downloadExport(preparedExport.tiddlers);
}
