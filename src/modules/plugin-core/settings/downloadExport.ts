import { Notice } from 'obsidian';
import { triggerDownloadModalForJSON } from '@/modules/plugin-core/settings/triggerDownloadModalForJSON';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export function downloadExport(tiddlers: Tiddler[]): void {
  triggerDownloadModalForJSON(tiddlers, 'tiddlywiki-export.json');

  new Notice(`Exported ${tiddlers.length} files to TiddlyWiki JSON.`);
}
