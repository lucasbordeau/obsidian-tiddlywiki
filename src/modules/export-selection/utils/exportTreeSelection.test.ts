import { ExportTreeNode } from '../types/ExportTreeNode';
import {
  getExportFilePaths,
  getExportTreeSelectionState,
  updateExportTreeSelection,
} from './exportTreeSelection';

const projectsFolder: ExportTreeNode = {
  type: 'folder',
  name: 'Projects',
  path: 'Projects',
  children: [
    {
      type: 'file',
      name: 'Roadmap.md',
      path: 'Projects/Roadmap.md',
    },
    {
      type: 'folder',
      name: 'Archive',
      path: 'Projects/Archive',
      children: [
        {
          type: 'file',
          name: '2024.md',
          path: 'Projects/Archive/2024.md',
        },
      ],
    },
  ],
};

describe('export tree selection', () => {
  test('collects every file path below a folder', () => {
    expect(getExportFilePaths(projectsFolder)).toEqual([
      'Projects/Roadmap.md',
      'Projects/Archive/2024.md',
    ]);
  });

  test('selects and clears a complete folder subtree', () => {
    const initialSelection = new Set(['Inbox.md']);
    const selectedFolder = updateExportTreeSelection(
      initialSelection,
      projectsFolder,
      true,
    );
    const clearedFolder = updateExportTreeSelection(
      selectedFolder,
      projectsFolder,
      false,
    );

    expect(selectedFolder).toEqual(
      new Set(['Inbox.md', 'Projects/Roadmap.md', 'Projects/Archive/2024.md']),
    );
    expect(clearedFolder).toEqual(new Set(['Inbox.md']));
    expect(initialSelection).toEqual(new Set(['Inbox.md']));
  });

  test('reports partial and complete folder states', () => {
    const partialSelection = new Set(['Projects/Roadmap.md']);
    const completeSelection = new Set(getExportFilePaths(projectsFolder));

    expect(getExportTreeSelectionState(projectsFolder, partialSelection)).toBe(
      'partial',
    );
    expect(getExportTreeSelectionState(projectsFolder, completeSelection)).toBe(
      'selected',
    );
    expect(getExportTreeSelectionState(projectsFolder, new Set())).toBe(
      'unselected',
    );
  });
});
