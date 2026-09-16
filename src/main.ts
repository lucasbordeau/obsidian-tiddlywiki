import { Plugin } from 'obsidian';
import { openImportJsonPicker } from '@/modules/plugin-core/settings/openImportJsonPicker';
import { exportVaultToJson } from '@/modules/plugin-core/settings/exportVaultToJson';

export default class ObsidianTiddlyWikiPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'import-tiddlywiki-json',
      name: 'Import TiddlyWiki JSON',
      callback: () => openImportJsonPicker(this.app),
    });

    this.addCommand({
      id: 'export-vault-to-tiddlywiki-json',
      name: 'Export vault to TiddlyWiki JSON',
      callback: () => exportVaultToJson(this.app),
    });
  }
}
