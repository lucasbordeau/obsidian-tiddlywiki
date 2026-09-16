import { ExportTreeNode } from '@/modules/export-selection/ExportTreeNode';

export function getExportFilePaths(exportTreeNode: ExportTreeNode): string[] {
  if (exportTreeNode.type === 'file') {
    return [exportTreeNode.path];
  }

  return exportTreeNode.children.flatMap(getExportFilePaths);
}
