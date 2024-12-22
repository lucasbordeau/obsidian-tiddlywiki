import * as fs from 'fs';
import * as path from 'path';
import { MediaFile } from 'src/modules/file-manipulation/types/MediaFile';
import { getFileDates } from 'src/modules/file-manipulation/utils/getFileDates';
import { getMimeTypeFromFilePath } from 'src/modules/file-manipulation/utils/getMimeTypeFromFilePath';

export async function getMediaFilesInDirectory(
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
      const mediaFilesInSubdirectory = await getMediaFilesInDirectory(filePath);

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
