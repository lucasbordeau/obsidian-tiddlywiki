import { Vault } from 'obsidian';
import { writeObsidianNotesToDirectory } from '@/modules/obsidian/writeObsidianNotesToDirectory';

describe('writing imported Markdown notes', () => {
  test('passes original timestamps to Obsidian when creating files', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const vault = { create } as unknown as Vault;

    await writeObsidianNotesToDirectory(
      vault,
      [
        {
          title: 'Project/Cedar',
          content: '---\ntags:\n  - Project\n---\nBody',
          creationTimeMs: Date.UTC(2024, 1, 29, 21, 30, 12, 456),
          modificationTimeMs: Date.UTC(2026, 8, 16, 11, 0, 0),
        },
        { title: 'Undated', content: 'Body' },
      ],
      'TiddlyWiki-Import-test',
    );

    expect(create).toHaveBeenNthCalledWith(
      1,
      'TiddlyWiki-Import-test/ProjectCedar.md',
      '---\ntags:\n  - Project\n---\nBody',
      {
        ctime: Date.UTC(2024, 1, 29, 21, 30, 12, 456),
        mtime: Date.UTC(2026, 8, 16, 11, 0, 0),
      },
    );

    expect(create).toHaveBeenNthCalledWith(
      2,
      'TiddlyWiki-Import-test/Undated.md',
      'Body',
      {},
    );
  });
});
