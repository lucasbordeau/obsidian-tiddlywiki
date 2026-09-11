import type { App } from 'obsidian';
import * as path from 'path';
import { getVaultDirectory } from './getVaultDirectory';

export function getImportPath(app: App): string {
  const currentDate = new Date().toISOString().replace(/:/g, '_');
  const directoryName = `TiddlyWiki-Import-${currentDate}`;

  return path.join(getVaultDirectory(app), directoryName);
}
