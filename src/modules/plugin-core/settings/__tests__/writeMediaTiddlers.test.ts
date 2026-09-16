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
});
