import { App } from 'obsidian';
import { Setting } from 'obsidian';
import { exportVaultToJson } from '@/modules/plugin-core/settings/exportVaultToJson';

export function renderExportJsonButton(
  app: App,
  pluginContainerElement: HTMLElement,
): void {
  pluginContainerElement.createEl('h2', { text: 'Export' });

  new Setting(pluginContainerElement)
    .setName('Export JSON')
    .setDesc(
      'The JSON file exported from this plugin can then be imported in TiddlyWiki. In TiddlyWiki go to Tools->Import',
    )
    .addButton((button) =>
      button
        .setButtonText('Export .json')
        .onClick(() => exportVaultToJson(app)),
    );
}
