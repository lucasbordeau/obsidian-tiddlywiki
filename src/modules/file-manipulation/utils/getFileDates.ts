import { stat } from 'fs/promises';

export async function getFileDates(
  filePath: string,
): Promise<{ creationDate: Date; lastModifiedDate: Date }> {
  try {
    const stats = await stat(filePath);
    return {
      creationDate: stats.birthtime, // File creation date
      lastModifiedDate: stats.mtime, // Last modified date
    };
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
}
