import { App, Notice, TFolder } from 'obsidian';
import { readFilePathToJSON } from '@/modules/file-manipulation/readFilePathToJSON';
import { writeObsidianNotesToDirectory } from '@/modules/obsidian/writeObsidianNotesToDirectory';
import { getImportPath } from '@/modules/plugin-core/settings/getImportPath';
import { importTiddlyWikiJsonPath } from '@/modules/plugin-core/settings/importTiddlyWikiJsonFile';
import { writeMediaTiddlers } from '@/modules/plugin-core/settings/writeMediaTiddlers';

jest.mock('obsidian', () => ({ Notice: jest.fn() }), { virtual: true });

jest.mock('@/modules/file-manipulation/readFilePathToJSON', () => ({
  readFilePathToJSON: jest.fn(),
}));

jest.mock('@/modules/obsidian/writeObsidianNotesToDirectory', () => ({
  writeObsidianNotesToDirectory: jest.fn(),
}));

jest.mock('@/modules/plugin-core/settings/getImportPath', () => ({
  getImportPath: jest.fn(),
}));

jest.mock('@/modules/plugin-core/settings/writeMediaTiddlers', () => ({
  writeMediaTiddlers: jest.fn(),
}));

const importFolderPath = 'TiddlyWiki-Import-test';
const importPath = `/tmp/vault/${importFolderPath}`;
const importFolder = { path: importFolderPath } as TFolder;

const vault = {
  createFolder: jest.fn(),
  getAbstractFileByPath: jest.fn(),
  delete: jest.fn(),
  adapter: { rmdir: jest.fn() },
};

const app = { vault } as unknown as App;

describe('TiddlyWiki JSON host import', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(getImportPath).mockReturnValue(importPath);
    jest.mocked(readFilePathToJSON).mockResolvedValue([]);
    jest.mocked(writeMediaTiddlers).mockResolvedValue(undefined);
    jest.mocked(writeObsidianNotesToDirectory).mockResolvedValue(undefined);
    vault.createFolder.mockResolvedValue(undefined);
    vault.getAbstractFileByPath.mockReturnValue(importFolder);
    vault.delete.mockResolvedValue(undefined);
    vault.adapter.rmdir.mockResolvedValue(undefined);
  });

  test('validates every tiddler before creating the import folder', async () => {
    jest
      .mocked(readFilePathToJSON)
      .mockResolvedValue([{ title: '', text: 'Invalid title' }]);

    await expect(
      importTiddlyWikiJsonPath(app, '/tmp/source.json'),
    ).rejects.toThrow('needs a nonempty title');

    expect(vault.createFolder).not.toHaveBeenCalled();
    expect(writeMediaTiddlers).not.toHaveBeenCalled();
    expect(writeObsidianNotesToDirectory).not.toHaveBeenCalled();
  });

  test.each([
    ['media', writeMediaTiddlers],
    ['note', writeObsidianNotesToDirectory],
  ])('removes the new folder after a %s write failure', async (_, writer) => {
    jest
      .mocked(readFilePathToJSON)
      .mockResolvedValue([{ title: 'Valid', text: 'Body' }]);

    jest.mocked(writer).mockRejectedValueOnce(new Error('disk full'));

    await expect(
      importTiddlyWikiJsonPath(app, '/tmp/source.json'),
    ).rejects.toThrow('disk full');

    expect(vault.delete).toHaveBeenCalledWith(importFolder, true);
    expect(Notice).not.toHaveBeenCalled();
  });

  test('removes an unindexed folder through the vault adapter after a write failure', async () => {
    jest
      .mocked(readFilePathToJSON)
      .mockResolvedValue([{ title: 'Valid', text: 'Body' }]);

    jest
      .mocked(writeMediaTiddlers)
      .mockRejectedValueOnce(new Error('disk full'));

    vault.getAbstractFileByPath.mockReturnValue(null);

    await expect(
      importTiddlyWikiJsonPath(app, '/tmp/source.json'),
    ).rejects.toThrow('disk full');

    expect(vault.adapter.rmdir).toHaveBeenCalledWith(importFolderPath, true);
  });

  test('reports omitted-source warnings with their note title and source reminder', async () => {
    const warningLog = jest.spyOn(console, 'warn').mockImplementation();

    jest
      .mocked(readFilePathToJSON)
      .mockResolvedValue([
        { title: 'Macro note', text: 'Before <<greet>> after' },
      ]);

    await importTiddlyWikiJsonPath(app, '/tmp/source.json');

    const noticeText = jest.mocked(Notice).mock.calls[0][0];

    expect(noticeText).toContain('1 omitted source region');
    expect(noticeText).toContain('Macro note');
    expect(noticeText).toContain('OMITTED_SOURCE');
    expect(noticeText).toContain('source JSON');

    expect(warningLog).toHaveBeenCalledWith(
      'TiddlyWiki import conversion warnings:',
      expect.arrayContaining([expect.stringContaining('OMITTED_SOURCE')]),
    );

    const importedNotes = jest.mocked(writeObsidianNotesToDirectory).mock
      .calls[0][1];

    expect(importedNotes[0].content).not.toContain('<<greet>>');

    warningLog.mockRestore();
  });

  test('keeps ordinary text as notes and text files as attachments', async () => {
    const warningLog = jest.spyOn(console, 'warn').mockImplementation();

    jest.mocked(readFilePathToJSON).mockResolvedValue([
      { title: 'Ordinary note', type: 'text/plain', text: 'Body' },
      { title: 'Markdown.md', type: 'text/markdown', text: '# Title' },
      {
        title: 'Wiki title.canvas',
        type: 'text/vnd.tiddlywiki',
        text: '! Heading',
      },
      { title: 'Untyped title.base', text: 'Body' },
      { title: 'Wiki title.json', type: 'text/vnd.tiddlywiki', text: 'Body' },
      { title: 'theme.css', type: 'text/css', text: '.page { color: red; }' },
      { title: 'Guide.txt', type: 'text/plain', text: 'Read me' },
      { title: 'Page.html', type: 'text/html', text: '<h1>Title</h1>' },
      { title: 'Table.csv', type: 'text/csv', text: 'name,value' },
      { title: 'Options.yaml', type: 'text/yaml', text: 'enabled: true' },
      { title: 'Feed.xml', type: 'application/xml', text: '<feed />' },
      { title: 'Data.json', type: 'application/json', text: '{"valid":true}' },
      {
        title: 'Script.js',
        type: 'application/javascript',
        text: 'const x = 1;',
      },
      { title: 'Board.canvas', type: 'application/json', text: '{"nodes":[]}' },
      { title: 'Library.base', type: 'text/plain', text: 'views: []' },
    ]);

    await importTiddlyWikiJsonPath(app, '/tmp/source.json');

    const importedNotes = jest.mocked(writeObsidianNotesToDirectory).mock
      .calls[0][1];

    expect(importedNotes.map((note) => note.title)).toEqual([
      'Ordinary note',
      'Markdown.md',
      'Wiki title.canvas',
      'Untyped title.base',
      'Wiki title.json',
    ]);

    warningLog.mockRestore();
  });
});
