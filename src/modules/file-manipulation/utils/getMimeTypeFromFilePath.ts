import { lookup } from 'mime-types';

export function getMimeTypeFromFilePath(filePath: string): string {
  const mimeType = lookup(filePath);

  if (!mimeType) {
    throw new Error(
      `getMimeTypeFromFilePath : Could not find mime type for ${filePath}`,
    );
  }

  return mimeType;
}
