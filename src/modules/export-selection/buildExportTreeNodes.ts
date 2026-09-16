import { TAbstractFile, TFile, TFolder } from 'obsidian';
import { ExportTreeNode } from '@/modules/export-selection/ExportTreeNode';

function isHiddenVaultPath(vaultPath: string): boolean {
  return vaultPath
    .split('/')
    .some((vaultPathPart) => vaultPathPart.startsWith('.'));
}

export function buildExportTreeNodes(
  vaultFiles: TAbstractFile[],
): ExportTreeNode[] {
  const exportTreeNodes: ExportTreeNode[] = [];

  for (const vaultFile of vaultFiles) {
    if (isHiddenVaultPath(vaultFile.path)) {
      continue;
    }

    if (vaultFile instanceof TFile) {
      exportTreeNodes.push({
        type: 'file',
        name: vaultFile.name,
        path: vaultFile.path,
      });

      continue;
    }

    if (vaultFile instanceof TFolder) {
      const childExportTreeNodes = buildExportTreeNodes(vaultFile.children);
      const folderContainsExportableFiles = childExportTreeNodes.length > 0;

      if (folderContainsExportableFiles) {
        exportTreeNodes.push({
          type: 'folder',
          name: vaultFile.name,
          path: vaultFile.path,
          children: childExportTreeNodes,
        });
      }
    }
  }

  return exportTreeNodes.sort((firstNode, secondNode) => {
    const nodeTypesDiffer = firstNode.type !== secondNode.type;

    if (nodeTypesDiffer) {
      return firstNode.type === 'folder' ? -1 : 1;
    }

    return firstNode.name.localeCompare(secondNode.name);
  });
}
