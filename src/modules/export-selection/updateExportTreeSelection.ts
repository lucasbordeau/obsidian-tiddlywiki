import { ExportTreeNode } from '@/modules/export-selection/ExportTreeNode';
import { getExportFilePaths } from '@/modules/export-selection/getExportFilePaths';

export function updateExportTreeSelection(
  selectedExportFilePaths: ReadonlySet<string>,
  exportTreeNode: ExportTreeNode,
  shouldSelect: boolean,
): Set<string> {
  const updatedSelectedExportFilePaths = new Set(selectedExportFilePaths);
  const affectedExportFilePaths = getExportFilePaths(exportTreeNode);

  for (const exportFilePath of affectedExportFilePaths) {
    if (shouldSelect) {
      updatedSelectedExportFilePaths.add(exportFilePath);
    } else {
      updatedSelectedExportFilePaths.delete(exportFilePath);
    }
  }

  return updatedSelectedExportFilePaths;
}
