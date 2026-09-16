import { Notice } from 'obsidian';
import { triggerDownloadModalForJSON } from '@/modules/plugin-core/settings/triggerDownloadModalForJSON';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export function downloadExport(tiddlers: Tiddler[], brokenLinkCount = 0): void {
  triggerDownloadModalForJSON(tiddlers, 'tiddlywiki-export.json');

  const warning =
    brokenLinkCount === 0
      ? ''
      : ` ${brokenLinkCount} ${brokenLinkCount === 1 ? 'link' : 'links'} to excluded files ${brokenLinkCount === 1 ? 'was' : 'were'} converted to text.`;

  new Notice(`Exported ${tiddlers.length} files to TiddlyWiki JSON.${warning}`);
}
