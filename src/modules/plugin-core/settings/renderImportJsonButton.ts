import type { App } from 'obsidian';
import { Setting } from 'obsidian';
import { openImportJsonPicker } from './openImportJsonPicker';

export function renderImportJsonButton(
  app: App,
  pluginContainerElement: HTMLElement,
): void {
  pluginContainerElement.createEl('h2', { text: 'Import' });

  new Setting(pluginContainerElement)
    .setName('Import JSON')
    .setDesc(
      'You need to first export a JSON file from TiddlyWiki to import it here. In TiddlyWiki, go to Tools->Export all->JSON File',
    )
    .addButton((button) =>
      button
        .setButtonText('Import .json')
        .onClick(() => openImportJsonPicker(app)),
    );
}
