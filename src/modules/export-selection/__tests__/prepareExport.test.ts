import { App } from 'obsidian';
import { prepareExport } from '@/modules/export-selection/prepareExport';

describe('vault export preparation', () => {
  test('reads Markdown timestamps from Obsidian file stats', async () => {
    const markdownFile = {
      path: 'Archive/Dated note.md',
      basename: 'Dated note',
      extension: 'md',
      stat: {
        ctime: Date.parse('2024-02-29T21:30:12.456Z'),
        mtime: Date.parse('2026-09-16T11:00:00.789Z'),
      },
    };

    const app = {
      vault: {
        adapter: { basePath: '/vault' },
        getFiles: jest.fn().mockReturnValue([markdownFile]),
        cachedRead: jest
          .fn()
          .mockResolvedValue('---\ntags: [project]\n---\nBody'),
      },
      metadataCache: {
        getFirstLinkpathDest: jest.fn().mockReturnValue(null),
      },
    } as unknown as App;

    const preparedExport = await prepareExport(
      app,
      new Set([markdownFile.path]),
    );

    expect(preparedExport.tiddlers).toHaveLength(1);
    expect(preparedExport.tiddlers[0].created).toBe('20240229213012456');
    expect(preparedExport.tiddlers[0].modified).toBe('20260916110000789');
    expect(preparedExport.tiddlers[0].tags).toBe('project');
    expect(preparedExport.brokenLinkCount).toBe(0);
  });
});
