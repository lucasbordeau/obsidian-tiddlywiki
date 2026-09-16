import { App } from 'obsidian';
import { prepareExport } from '@/modules/export-selection/prepareExport';
import { downloadExport } from '@/modules/plugin-core/settings/downloadExport';
import { exportVaultToJson } from '@/modules/plugin-core/settings/exportVaultToJson';

jest.mock('@/modules/export-selection/prepareExport', () => ({
  prepareExport: jest.fn(),
}));

jest.mock('@/modules/plugin-core/settings/downloadExport', () => ({
  downloadExport: jest.fn(),
}));

describe('whole-vault export command', () => {
  test('exports visible vault files and skips hidden paths', async () => {
    const vaultFiles = [
      { path: 'Inbox.md' },
      { path: 'Projects/Plan.md' },
      { path: 'Projects/.draft.md' },
      { path: '.private/Notes.md' },
    ];

    const app = {
      vault: { getFiles: jest.fn().mockReturnValue(vaultFiles) },
    } as unknown as App;

    jest.mocked(prepareExport).mockResolvedValue({
      tiddlers: [],
      brokenLinkCount: 0,
    });

    await exportVaultToJson(app);

    expect(prepareExport).toHaveBeenCalledWith(
      app,
      new Set(['Inbox.md', 'Projects/Plan.md']),
    );

    expect(downloadExport).toHaveBeenCalledWith([]);
  });
});
