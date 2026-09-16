export type ExportFileNode = {
  type: 'file';
  name: string;
  path: string;
};

export type ExportFolderNode = {
  type: 'folder';
  name: string;
  path: string;
  children: ExportTreeNode[];
};

export type ExportTreeNode = ExportFileNode | ExportFolderNode;

export type ExportTreeSelectionState = 'selected' | 'partial' | 'unselected';
