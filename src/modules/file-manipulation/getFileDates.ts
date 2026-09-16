import { Temporal } from '@js-temporal/polyfill';
import { stat } from 'fs/promises';

export async function getFileDates(filePath: string): Promise<{
  creationDate: Temporal.Instant;
  lastModifiedDate: Temporal.Instant;
}> {
  try {
    const stats = await stat(filePath);

    return {
      creationDate: Temporal.Instant.fromEpochMilliseconds(
        Math.trunc(stats.birthtimeMs),
      ),
      lastModifiedDate: Temporal.Instant.fromEpochMilliseconds(
        Math.trunc(stats.mtimeMs),
      ),
    };
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
}
