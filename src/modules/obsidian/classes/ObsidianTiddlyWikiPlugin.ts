import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import * as path from 'path';
import {
  convertJSONToTiddlers,
  convertTiddlersToObsidianMarkdown,
  writeObsidianMarkdownFiles,
} from 'src/services/TiddlyWikiToMarkdownService';

import ObsidianTiddlyWikiPlugin from 'src/main';
import { exportAllMarkdownFilesToJSON } from 'src/services/MarkdownToTiddlyWikiService';
import { downloadJsonAsFile } from 'src/utils/downloadJsonAsFile';

export class ObsidianTiddlyWikiSettingsTab extends PluginSettingTab {
  plugin: ObsidianTiddlyWikiPlugin;

  constructor(app: App, plugin: ObsidianTiddlyWikiPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl: pluginContainerElement } = this;

    this.renderPluginHeader(pluginContainerElement);

    this.renderImportJsonButton(pluginContainerElement);

    this.renderExportJsonButton(pluginContainerElement);
  }

  private renderPluginHeader(pluginContainerElement: HTMLElement) {
    pluginContainerElement.empty();

    pluginContainerElement.createEl('h1', { text: 'Import / Export' });
  }

  private renderExportJsonButton(pluginContainerElement: HTMLElement) {
    pluginContainerElement.createEl('h2', { text: 'Export' });

    new Setting(pluginContainerElement)
      .setName('Export JSON')
      .setDesc(
        'The JSON file exported from this plugin can then be imported in TiddlyWiki. In TiddlyWiki go to Tools->Import',
      )
      .addButton((button) =>
        button.setButtonText('Export .json').onClick(async () => {
          //@ts-ignore
          const basePath = this.app.vault.adapter.basePath;

          const jsonExport = await exportAllMarkdownFilesToJSON(basePath);

          downloadJsonAsFile(jsonExport, 'test.json');
        }),
      );
  }

  private renderImportJsonButton(pluginContainerElement: HTMLElement) {
    pluginContainerElement.createEl('h2', { text: 'Import' });

    const uploadForm = this.createUploadFormContainer(pluginContainerElement);

    const fileUploadInput = this.setupFileUploadInput(
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

  private handleFileUploadInputChange = async (input: HTMLInputElement) => {
    if (input.files && input.files.length > 0) {
      for (let fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
        const file = input.files.item(fileIndex);

        if (!file) {
          throw new Error('File is not defined');
        }

        const currentDate = new Date().toISOString().replace(/:/g, '_');

        const directoryPath = `TiddlyWiki-Import-${currentDate}`;

        const exportPath = path.join(
          //@ts-ignore
          this.app.vault.adapter.basePath,
          directoryPath,
        );

        const tiddlers = await convertJSONToTiddlers(file);
        const obsidianMarkdownArray =
          convertTiddlersToObsidianMarkdown(tiddlers);
        writeObsidianMarkdownFiles(obsidianMarkdownArray, exportPath);

        new Notice(
          `✅ Successfuly imported TiddlyWiki to ${exportPath}`,
          10000,
        );
      }
    }
  };

  private setupFileUploadInput(
    pluginContainerElement: HTMLElement,
    form: HTMLFormElement,
  ) {
    const input = this.createFileInputElement(pluginContainerElement);

    input.addEventListener('change', () =>
      this.handleFileUploadInputChange(input),
    );

    form.appendChild(input);

    return input;
  }

  private createFileInputElement(pluginContainerElement: HTMLElement) {
    const input = pluginContainerElement.createEl('input');

    input.type = 'file';
    input.id = 'file-upload';
    input.multiple = false;
    input.accept = '.json';

    return input;
  }

  private createUploadFormContainer(pluginContainerElement: HTMLElement) {
    const form = pluginContainerElement.createEl('form', {
      attr: { encType: 'multipart/form-data', hidden: true },
    });

    return form;
  }
}
