import { convertBase64ToFileObject } from '@/modules/file-manipulation/convertBase64ToFileObject';
import { writeFileObjectToFilePath } from '@/modules/file-manipulation/writeFileObjectToFilePath';
import { writeMediaTiddlers } from '@/modules/plugin-core/settings/writeMediaTiddlers';

jest.mock('@/modules/file-manipulation/convertBase64ToFileObject', () => ({
  convertBase64ToFileObject: jest.fn(),
}));

jest.mock('@/modules/file-manipulation/writeFileObjectToFilePath', () => ({
  writeFileObjectToFilePath: jest.fn(),
}));

const convertMedia = jest.mocked(convertBase64ToFileObject);
const writeMedia = jest.mocked(writeFileObjectToFilePath);

describe('TiddlyWiki media import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('writes embedded media and leaves canonical external media as URLs', async () => {
    const embeddedFile = { name: 'Embedded signal.mp3' } as File;

    convertMedia.mockReturnValue(embeddedFile);
    writeMedia.mockResolvedValue(undefined);

    await writeMediaTiddlers(
      [
        {
          title: 'Embedded signal.mp3',
          type: 'audio/mpeg',
          text: 'YmFzZTY0',
        },
        {
          title: 'Remote signal.mp3',
          type: 'audio/mpeg',
          text: '',
          _canonical_uri: 'https://example.org/signal.mp3',
        },
        {
          title: 'Ordinary note',
          type: 'text/vnd.tiddlywiki',
          text: 'Body',
        },
      ],
      '/tmp/imported-notes',
    );

    expect(convertMedia).toHaveBeenCalledTimes(1);

    expect(convertMedia).toHaveBeenCalledWith(
      'YmFzZTY0',
      'Embedded signal.mp3',
      'audio/mpeg',
    );

    expect(writeMedia).toHaveBeenCalledWith(
      embeddedFile,
      '/tmp/imported-notes/Embedded signal.mp3',
    );
  });

  test.each([
    { title: 'Board.canvas', type: 'application/json', text: '{"nodes":[]}' },
    {
      title: 'Script.js',
      type: 'application/javascript',
      text: 'const n = 1;',
    },
    { title: 'Library.base', type: 'text/plain', text: 'views:\n  - table' },
    {
      title: 'Dictionary',
      type: 'application/x-tiddler-dictionary',
      text: 'key: value: with a colon',
    },
  ])('writes textual attachment $title as UTF-8', async (tiddler) => {
    writeMedia.mockResolvedValue(undefined);

    await writeMediaTiddlers([tiddler], '/tmp/imported-notes');

    expect(convertMedia).not.toHaveBeenCalled();
    expect(writeMedia).toHaveBeenCalledTimes(1);

    const [writtenFile, writtenPath] = writeMedia.mock.calls[0];

    expect(writtenPath).toBe(`/tmp/imported-notes/${tiddler.title}`);
    expect(await writtenFile.text()).toBe(tiddler.text);
    expect(writtenFile.type).toBe(tiddler.type);
  });

  test.each(['Board.canvas', 'Library.base'])(
    'decodes explicit binary MIME for %s despite its extension',
    async (title) => {
      const binaryFile = { name: title } as File;

      convertMedia.mockReturnValue(binaryFile);
      writeMedia.mockResolvedValue(undefined);

      await writeMediaTiddlers(
        [{ title, type: 'application/octet-stream', text: 'YmluYXJ5' }],
        '/tmp/imported-notes',
      );

      expect(convertMedia).toHaveBeenCalledWith(
        'YmluYXJ5',
        title,
        'application/octet-stream',
      );

      expect(writeMedia).toHaveBeenCalledWith(
        binaryFile,
        `/tmp/imported-notes/${title}`,
      );
    },
  );

  test.each([
    '../existing.md',
    '/tmp/existing.md',
    'nested/../../existing.md',
    '..\\existing.md',
    'C:\\existing.md',
    '\\\\server\\share\\existing.md',
  ])(
    'rejects an attachment title outside the import folder: %s',
    async (title) => {
      convertMedia.mockReturnValue({ name: title } as File);
      writeMedia.mockResolvedValue(undefined);

      await expect(
        writeMediaTiddlers(
          [{ title, type: 'image/png', text: 'aW1hZ2U=' }],
          '/tmp/imported-notes',
        ),
      ).rejects.toThrow();

      expect(writeMedia).not.toHaveBeenCalled();
    },
  );

  test('rejects case-insensitive duplicate attachment destinations before writing', async () => {
    convertMedia.mockImplementation((_, title) => ({ name: title }) as File);
    writeMedia.mockResolvedValue(undefined);

    await expect(
      writeMediaTiddlers(
        [
          { title: 'Photo.png', type: 'image/png', text: 'aW1hZ2U=' },
          { title: 'photo.png', type: 'image/png', text: 'aW1hZ2U=' },
        ],
        '/tmp/imported-notes',
      ),
    ).rejects.toThrow('Duplicate attachment destination');

    expect(writeMedia).not.toHaveBeenCalled();
  });
});
