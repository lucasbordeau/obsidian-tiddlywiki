import {
  ExportTreeNode,
  ExportTreeSelectionState,
} from '../types/ExportTreeNode';

export function getExportFilePaths(exportTreeNode: ExportTreeNode): string[] {
  if (exportTreeNode.type === 'file') {
    return [exportTreeNode.path];
  }

  return exportTreeNode.children.flatMap(getExportFilePaths);
}

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
