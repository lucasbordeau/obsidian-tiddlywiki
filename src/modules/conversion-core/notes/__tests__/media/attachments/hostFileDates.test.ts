import { mkdtemp, rm, utimes, writeFile } from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Temporal } from '@js-temporal/polyfill';
import { convertMediaFileToBase64Object } from '@/modules/file-manipulation/convertMediaFileToBase64Object';
import { getFileDates } from '@/modules/file-manipulation/getFileDates';
import { convertBase64ObjectToTiddler } from '@/modules/tiddlywiki/convertBase64ObjectToTiddler';

describe('host file timestamps', () => {
  it('exports filesystem timestamps as fixed millisecond UTC instants', async () => {
    const temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), 'tiddlywiki-media-date-'),
    );

    const filePath = path.join(temporaryDirectory, 'picture.bin');
    const modifiedInstant = Temporal.Instant.from('2024-02-29T21:30:12Z');

    try {
      await writeFile(filePath, Buffer.from([0, 1, 255]));

      await utimes(
        filePath,
        modifiedInstant.epochMilliseconds / 1000,
        modifiedInstant.epochMilliseconds / 1000,
      );

      const fileDates = await getFileDates(filePath);

      const mediaFile = {
        filePath,
        extension: '.bin',
        mimeType: 'application/octet-stream',
        ...fileDates,
      };

      const tiddler = convertBase64ObjectToTiddler(
        convertMediaFileToBase64Object(mediaFile),
      );

      expect(fileDates.creationDate).toBeInstanceOf(Temporal.Instant);
      expect(fileDates.lastModifiedDate).toBeInstanceOf(Temporal.Instant);

      expect(tiddler.created).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      expect(tiddler.modified).toBe('2024-02-29T21:30:12.000Z');
      expect(tiddler.text).toBe('AAH/');
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
