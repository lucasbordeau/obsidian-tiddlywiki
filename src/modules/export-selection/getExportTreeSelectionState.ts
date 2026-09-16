import {
  ExportTreeNode,
  ExportTreeSelectionState,
} from '@/modules/export-selection/ExportTreeNode';
import { getExportFilePaths } from '@/modules/export-selection/getExportFilePaths';

export function getExportTreeSelectionState(
  exportTreeNode: ExportTreeNode,
  selectedExportFilePaths: ReadonlySet<string>,
): ExportTreeSelectionState {
  const affectedExportFilePaths = getExportFilePaths(exportTreeNode);

  const selectedExportFileCount = affectedExportFilePaths.filter(
    (exportFilePath) => selectedExportFilePaths.has(exportFilePath),
  ).length;

  const everyExportFileIsSelected =
    selectedExportFileCount === affectedExportFilePaths.length;

  if (everyExportFileIsSelected) {
    return 'selected';
  }

  if (selectedExportFileCount > 0) {
    return 'partial';
  }

  return 'unselected';
}
