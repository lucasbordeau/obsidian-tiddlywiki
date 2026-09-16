import { Notice } from 'obsidian';
import { downloadExport } from '@/modules/plugin-core/settings/downloadExport';
import { triggerDownloadModalForJSON } from '@/modules/plugin-core/settings/triggerDownloadModalForJSON';

jest.mock('obsidian', () => ({ Notice: jest.fn() }), { virtual: true });

jest.mock('@/modules/plugin-core/settings/triggerDownloadModalForJSON', () => ({
  triggerDownloadModalForJSON: jest.fn(),
}));

describe('export download notice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('warns when links to excluded files were flattened to text', () => {
    downloadExport([], 2);

    expect(triggerDownloadModalForJSON).toHaveBeenCalledWith(
      [],
      'tiddlywiki-export.json',
    );

    expect(Notice).toHaveBeenCalledWith(
      'Exported 0 files to TiddlyWiki JSON. 2 links to excluded files were converted to text.',
    );
  });
});
