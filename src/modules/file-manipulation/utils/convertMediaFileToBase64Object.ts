import * as fs from 'fs';
import * as path from 'path';
import { Base64Object } from '../types/Base64Object';
import { MediaFile } from '../types/MediaFile';

export function convertMediaFileToBase64Object(
  mediaFile: MediaFile,
): Base64Object {
  const base64 = fs.readFileSync(mediaFile.filePath, 'base64');

  return {
    base64,
    extension: mediaFile.extension,
    mimeType: mediaFile.mimeType,
    fileName: path.basename(mediaFile.filePath),
    creationDate: mediaFile.creationDate,
    lastModifiedDate: mediaFile.lastModifiedDate,
  };
}
