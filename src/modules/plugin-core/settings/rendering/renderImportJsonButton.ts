import type { App } from 'obsidian';
import { Setting } from 'obsidian';
import { createUploadFormContainer } from '../forms/createUploadFormContainer';
import { setupFileUploadInput } from '../forms/setupFileUploadInput';

export function renderImportJsonButton(
  app: App,
  pluginContainerElement: HTMLElement,
): void {
  pluginContainerElement.createEl('h2', { text: 'Import' });

  const uploadForm = createUploadFormContainer(pluginContainerElement);

  const fileUploadInput = setupFileUploadInput(
    app,
    pluginContainerElement,
    uploadForm,
  );

  new Setting(pluginContainerElement)
    .setName('Import JSON')
    .setDesc(
      'You need to first export a JSON file from TiddlyWiki to import it here. In TiddlyWiki, go to Tools->Export all->JSON File',
    )
    .addButton((button) =>
      button.setButtonText('Import .json').onClick(() => {
        fileUploadInput.click();
      }),
    );
}
