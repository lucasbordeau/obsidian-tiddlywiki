import type { App } from 'obsidian';
import { importTiddlyWikiJsonFile } from './importTiddlyWikiJsonFile';

export async function importSelectedFiles(
  app: App,
  input: HTMLInputElement,
): Promise<void> {
  if (input.files && input.files.length > 0) {
    for (let fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
      const file = input.files.item(fileIndex);

      if (!file) {
        throw new Error('File is not defined');
      }

      await importTiddlyWikiJsonFile(app, file);
    }
  }
}
