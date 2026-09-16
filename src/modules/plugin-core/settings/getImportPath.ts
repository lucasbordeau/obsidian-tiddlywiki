import { App } from 'obsidian';
import * as path from 'path';
import { Temporal } from '@js-temporal/polyfill';
import { getVaultDirectory } from '@/modules/plugin-core/settings/getVaultDirectory';

export function getImportPath(app: App): string {
  const currentDate = Temporal.Now.instant()
    .toString({ fractionalSecondDigits: 3 })
    .replace(/:/g, '_');

  const directoryName = `TiddlyWiki-Import-${currentDate}`;

  return path.join(getVaultDirectory(app), directoryName);
}
