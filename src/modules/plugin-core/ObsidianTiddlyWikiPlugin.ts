import * as fs from 'fs';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import * as path from 'path';
import { convertTiddlersToObsidianNotes } from 'src/modules/format-converters/convertTiddlersToObsidianNotes';
import { writeObsidianNotesToDirectory } from 'src/modules/obsidian/utils/writeObsidianNotesToDirectory';

import ObsidianTiddlyWikiPlugin from 'src/main';
import { convertBase64ToFileObject } from '../file-manipulation/utils/convertBase64ToFileObject';
import { convertMediaFileToBase64Object } from '../file-manipulation/utils/convertMediaFileToBase64Object';
import { readFileObjectToJSON } from '../file-manipulation/utils/readFileObjectToJSON';
import { writeFileObjectToFilePath } from '../file-manipulation/utils/writeFileObjectToFilePath';
import { convertObsidianNoteToTiddler } from '../format-converters/convertObsidianNoteToTiddler';
import { getAllObsidianNotesInDirectory } from '../obsidian/utils/getAllObsidianNotesInDirectory';
import { getMediaFilesInDirectory } from '../obsidian/utils/getMediaFilesInObsidianDirectory';
import { Tiddler } from '../tiddlywiki/types/Tiddler';
import { convertBase64ObjectToTiddler } from '../tiddlywiki/utils/convertBase64ObjectToTiddler';

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
          const obsidianDirectoryToExport = this.app.vault.adapter.basePath;

          const obsidianNotes = getAllObsidianNotesInDirectory(
            obsidianDirectoryToExport,
          );

          const mediaFiles = await getMediaFilesInDirectory(
            obsidianDirectoryToExport,
          );

          const mediaTiddlers = mediaFiles
            .map(convertMediaFileToBase64Object)
            .map(convertBase64ObjectToTiddler);

          const tiddlers = obsidianNotes.map(convertObsidianNoteToTiddler);

          const tiddlersToExport = [...tiddlers, ...mediaTiddlers];

          this.triggerDownloadModalForJSON(tiddlersToExport, 'test.json');
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

  private getImportPath() {
    const currentDate = new Date().toISOString().replace(/:/g, '_');

    const directoryName = `TiddlyWiki-Import-${currentDate}`;

    const importPath = path.join(
      //@ts-ignore
      this.app.vault.adapter.basePath,
      directoryName,
    );

    return importPath;
  }

  private handleFileUploadInputChange = async (input: HTMLInputElement) => {
    if (input.files && input.files.length > 0) {
      for (let fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
        const file = input.files.item(fileIndex);

        if (!file) {
          throw new Error('File is not defined');
        }

        const importPath = this.getImportPath();

        fs.mkdirSync(importPath, { recursive: true });

        const tiddlers: Tiddler[] = await readFileObjectToJSON(file);

        const nonTextTiddlers = tiddlers.filter(
          (tiddler) => 'type' in tiddler && !tiddler.type?.contains('text'),
        );

        const mediaFiles = nonTextTiddlers.map((nonTextTiddler) =>
          convertBase64ToFileObject(
            nonTextTiddler.text,
            nonTextTiddler.title,
            nonTextTiddler.type ?? 'text/plain',
          ),
        );

        for (const mediaFile of mediaFiles) {
          const mediaFilePath = path.join(importPath, mediaFile.name);

          await writeFileObjectToFilePath(mediaFile, mediaFilePath);
        }

        const textTiddlers = tiddlers.filter(
          (tiddler) => !('type' in tiddler) || tiddler.type?.contains('text'),
        );

        const obsidianNotes = convertTiddlersToObsidianNotes(textTiddlers);

        writeObsidianNotesToDirectory(obsidianNotes, importPath);

        new Notice(
          `✅ Successfuly imported TiddlyWiki to ${importPath}`,
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

  private triggerDownloadModalForJSON(jsonObject: any, fileName: string) {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
