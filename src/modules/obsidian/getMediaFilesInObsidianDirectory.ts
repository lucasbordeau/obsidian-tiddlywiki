import * as fs from 'fs';
import * as path from 'path';
import { MediaFile } from '@/modules/file-manipulation/MediaFile';
import { getFileDates } from '@/modules/file-manipulation/getFileDates';
import { getMimeTypeFromFilePath } from '@/modules/file-manipulation/getMimeTypeFromFilePath';

export async function getMediaFilesInObsidianDirectory(
  directoryPath: string,
): Promise<MediaFile[]> {
  const files = fs.readdirSync(directoryPath);

  const mediaFiles: MediaFile[] = [];

  for (const file of files) {
    if (file.startsWith('.')) {
      // Ignore hidden folders and files
      continue;
    }

    const filePath = path.join(directoryPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      // Recurse into subdirectory
      const mediaFilesInSubdirectory =
        await getMediaFilesInObsidianDirectory(filePath);

      mediaFiles.push(...mediaFilesInSubdirectory);
    } else if (path.extname(filePath) !== '.md') {
      const mediaFileDates = await getFileDates(filePath);

      const mediaFile: MediaFile = {
        extension: path.extname(filePath),
        filePath,
        mimeType: getMimeTypeFromFilePath(filePath),
        creationDate: mediaFileDates.creationDate,
        lastModifiedDate: mediaFileDates.lastModifiedDate,
      };

      mediaFiles.push(mediaFile);
    }
  }

  return mediaFiles;
}
