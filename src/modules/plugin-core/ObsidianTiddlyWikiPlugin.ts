import * as fs from 'fs';
import {
  App,
  ButtonComponent,
  Modal,
  Notice,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFile,
  TFolder,
} from 'obsidian';
import * as path from 'path';
import { convertTiddlersToObsidianNotes } from 'src/modules/format-converters/convertTiddlersToObsidianNotes';
import { writeObsidianNotesToDirectory } from 'src/modules/obsidian/utils/writeObsidianNotesToDirectory';

import ObsidianTiddlyWikiPlugin from 'src/main';
import { convertBase64ToFileObject } from '../file-manipulation/utils/convertBase64ToFileObject';
import { convertMediaFileToBase64Object } from '../file-manipulation/utils/convertMediaFileToBase64Object';
import { getMimeTypeFromFilePath } from '../file-manipulation/utils/getMimeTypeFromFilePath';
import { readFileObjectToJSON } from '../file-manipulation/utils/readFileObjectToJSON';
import { writeFileObjectToFilePath } from '../file-manipulation/utils/writeFileObjectToFilePath';
import { ExportTreeNode } from '../export-selection/types/ExportTreeNode';
import { ScopedExportNote } from '../export-selection/types/ScopedExportNote';
import {
  getExportFilePaths,
  getExportTreeSelectionState,
  updateExportTreeSelection,
} from '../export-selection/utils/exportTreeSelection';
import { replaceLinksOutsideExportScope } from '../export-selection/utils/replaceLinksOutsideExportScope';
import { convertObsidianNoteToTiddler } from '../format-converters/convertObsidianNoteToTiddler';
import { Tiddler } from '../tiddlywiki/types/Tiddler';
import { convertBase64ObjectToTiddler } from '../tiddlywiki/utils/convertBase64ObjectToTiddler';

type ExportTreeCheckbox = {
  checkbox: HTMLInputElement;
  exportTreeNode: ExportTreeNode;
};

type PreparedExport = {
  tiddlers: Tiddler[];
  brokenLinkCount: number;
};

class BrokenLinksWarningModal extends Modal {
  constructor(
    app: App,
    private readonly brokenLinkCount: number,
    private readonly continueExport: () => void,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('Links outside the export');
    const linkLabel = this.brokenLinkCount === 1 ? 'link' : 'links';
    const pronoun = this.brokenLinkCount === 1 ? 'It' : 'They';
    const linkVerb = this.brokenLinkCount === 1 ? 'points' : 'point';

    this.contentEl.createEl('p', {
      text: `${this.brokenLinkCount} ${linkLabel} ${linkVerb} to files outside your selection. ${pronoun} will be replaced with visible text in the exported JSON.`,
    });

    new Setting(this.contentEl)
      .addButton((button) =>
        button.setButtonText('Cancel').onClick(() => this.close()),
      )
      .addButton((button) =>
        button
          .setButtonText('Export anyway')
          .setCta()
          .onClick(() => {
            this.close();
            this.continueExport();
          }),
      );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export class ObsidianTiddlyWikiSettingsTab extends PluginSettingTab {
  plugin: ObsidianTiddlyWikiPlugin;
  private exportTreeNodes: ExportTreeNode[] = [];
  private selectedExportFilePaths = new Set<string>();
  private exportTreeCheckboxes: ExportTreeCheckbox[] = [];
  private exportSummaryElement?: HTMLElement;
  private exportButton?: ButtonComponent;

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

  private renderExportJsonButton(pluginContainerElement: HTMLElement): void {
    pluginContainerElement.createEl('h2', { text: 'Export' });

    this.exportTreeNodes = this.buildExportTreeNodes(
      this.app.vault.getRoot().children,
    );
    this.selectedExportFilePaths = new Set(
      this.exportTreeNodes.flatMap(getExportFilePaths),
    );
    this.exportTreeCheckboxes = [];

    new Setting(pluginContainerElement)
      .setName('Choose files and folders')
      .setDesc('Folder selections include every visible file inside them.')
      .addButton((button) =>
        button.setButtonText('Select all').onClick(() => {
          this.selectedExportFilePaths = new Set(
            this.exportTreeNodes.flatMap(getExportFilePaths),
          );
          this.updateExportSelectionUi();
        }),
      )
      .addButton((button) =>
        button.setButtonText('Clear').onClick(() => {
          this.selectedExportFilePaths = new Set();
          this.updateExportSelectionUi();
        }),
      );

    const exportTreeElement = pluginContainerElement.createDiv({
      cls: 'tiddlywiki-export-tree',
      attr: { 'aria-label': 'Files and folders to export' },
    });
    const exportTreeList = exportTreeElement.createEl('ul');

    for (const exportTreeNode of this.exportTreeNodes) {
      this.renderExportTreeNode(exportTreeList, exportTreeNode);
    }

    this.exportSummaryElement = pluginContainerElement.createEl('p', {
      cls: 'tiddlywiki-export-summary',
      attr: { 'aria-live': 'polite' },
    });

    new Setting(pluginContainerElement)
      .setName('Export JSON')
      .setDesc(
        'Broken internal links are counted before download. Links that point outside the selection are replaced with their visible text.',
      )
      .addButton((button) => {
        this.exportButton = button;
        button.buttonEl.addClass('tiddlywiki-export-button');
        button
          .setButtonText('Export .json')
          .setCta()
          .onClick(async () => {
            await this.handleExportButtonClick();
          });
      });

    this.updateExportSelectionUi();
  }

  private buildExportTreeNodes(vaultFiles: TAbstractFile[]): ExportTreeNode[] {
    const exportTreeNodes: ExportTreeNode[] = [];

    for (const vaultFile of vaultFiles) {
      if (this.isHiddenVaultPath(vaultFile.path)) {
        continue;
      }

      if (vaultFile instanceof TFile) {
        exportTreeNodes.push({
          type: 'file',
          name: vaultFile.name,
          path: vaultFile.path,
        });
        continue;
      }

      if (vaultFile instanceof TFolder) {
        const childExportTreeNodes = this.buildExportTreeNodes(
          vaultFile.children,
        );
        const folderContainsExportableFiles = childExportTreeNodes.length > 0;

        if (folderContainsExportableFiles) {
          exportTreeNodes.push({
            type: 'folder',
            name: vaultFile.name,
            path: vaultFile.path,
            children: childExportTreeNodes,
          });
        }
      }
    }

    return exportTreeNodes.sort((firstNode, secondNode) => {
      const nodeTypesDiffer = firstNode.type !== secondNode.type;

      if (nodeTypesDiffer) {
        return firstNode.type === 'folder' ? -1 : 1;
      }

      return firstNode.name.localeCompare(secondNode.name);
    });
  }

  private isHiddenVaultPath(vaultPath: string): boolean {
    return vaultPath
      .split('/')
      .some((vaultPathPart) => vaultPathPart.startsWith('.'));
  }

  private renderExportTreeNode(
    exportTreeList: HTMLUListElement,
    exportTreeNode: ExportTreeNode,
  ): void {
    const exportTreeListEntry = exportTreeList.createEl('li');

    if (exportTreeNode.type === 'folder') {
      const folderDetails = exportTreeListEntry.createEl('details', {
        attr: { open: 'open' },
      });
      const folderSummary = folderDetails.createEl('summary', {
        cls: 'tiddlywiki-export-node-row',
      });
      this.renderExportTreeCheckbox(folderSummary, exportTreeNode);
      folderSummary.createSpan({ text: exportTreeNode.name });

      const childExportTreeList = folderDetails.createEl('ul');
      for (const childExportTreeNode of exportTreeNode.children) {
        this.renderExportTreeNode(childExportTreeList, childExportTreeNode);
      }
      return;
    }

    const fileLabel = exportTreeListEntry.createEl('label', {
      cls: 'tiddlywiki-export-node-row',
    });
    this.renderExportTreeCheckbox(fileLabel, exportTreeNode);
    fileLabel.createSpan({ text: exportTreeNode.name });
  }

  private renderExportTreeCheckbox(
    exportTreeRow: HTMLElement,
    exportTreeNode: ExportTreeNode,
  ): void {
    const checkbox = exportTreeRow.createEl('input', {
      attr: {
        type: 'checkbox',
        'aria-label': `Include ${exportTreeNode.name} in export`,
        'data-export-path': exportTreeNode.path,
      },
    });

    checkbox.addEventListener('click', (event) => event.stopPropagation());
    checkbox.addEventListener('change', () => {
      this.selectedExportFilePaths = updateExportTreeSelection(
        this.selectedExportFilePaths,
        exportTreeNode,
        checkbox.checked,
      );
      this.updateExportSelectionUi();
    });

    this.exportTreeCheckboxes.push({ checkbox, exportTreeNode });
  }

  private updateExportSelectionUi(): void {
    for (const exportTreeCheckbox of this.exportTreeCheckboxes) {
      const selectionState = getExportTreeSelectionState(
        exportTreeCheckbox.exportTreeNode,
        this.selectedExportFilePaths,
      );
      exportTreeCheckbox.checkbox.checked = selectionState === 'selected';
      exportTreeCheckbox.checkbox.indeterminate = selectionState === 'partial';
    }

    const totalExportFileCount =
      this.exportTreeNodes.flatMap(getExportFilePaths).length;
    const selectedExportFileCount = this.selectedExportFilePaths.size;
    const selectedFileLabel = totalExportFileCount === 1 ? 'file' : 'files';

    this.exportSummaryElement?.setText(
      `${selectedExportFileCount} of ${totalExportFileCount} ${selectedFileLabel} selected. Broken links will be checked before download.`,
    );
    this.exportButton?.setDisabled(selectedExportFileCount === 0);
  }

  private async handleExportButtonClick(): Promise<void> {
    this.exportButton?.setDisabled(true).setButtonText('Preparing…');

    try {
      const preparedExport = await this.prepareExport();

      if (preparedExport.brokenLinkCount > 0) {
        new BrokenLinksWarningModal(
          this.app,
          preparedExport.brokenLinkCount,
          () => this.downloadExport(preparedExport.tiddlers),
        ).open();
      } else {
        this.downloadExport(preparedExport.tiddlers);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown export error';
      new Notice(`Unable to export: ${errorMessage}`, 10000);
    } finally {
      this.exportButton
        ?.setButtonText('Export .json')
        .setDisabled(this.selectedExportFilePaths.size === 0);
    }
  }

  private async prepareExport(): Promise<PreparedExport> {
    const selectedVaultFiles = this.app.vault
      .getFiles()
      .filter((vaultFile) => this.selectedExportFilePaths.has(vaultFile.path));
    const selectedMarkdownFiles = selectedVaultFiles.filter(
      (vaultFile) => vaultFile.extension === 'md',
    );
    const selectedMediaFiles = selectedVaultFiles.filter(
      (vaultFile) => vaultFile.extension !== 'md',
    );
    const noteReadPromises = selectedMarkdownFiles.map(
      async (markdownFile): Promise<ScopedExportNote> => ({
        title: markdownFile.basename,
        content: await this.app.vault.cachedRead(markdownFile),
        path: markdownFile.path,
      }),
    );
    const scopedExportNotes = await Promise.all(noteReadPromises);
    let brokenLinkCount = 0;

    const noteTiddlers = scopedExportNotes.map((scopedExportNote) => {
      const linkReplacement = replaceLinksOutsideExportScope(
        scopedExportNote.content,
        scopedExportNote.path,
        this.selectedExportFilePaths,
        (linkPath, sourcePath) =>
          this.resolveObsidianLinkPath(linkPath, sourcePath),
      );
      brokenLinkCount += linkReplacement.brokenLinkCount;

      return convertObsidianNoteToTiddler({
        title: scopedExportNote.title,
        content: linkReplacement.content,
      });
    });

    //@ts-ignore Obsidian's desktop adapter exposes the vault base path.
    const obsidianVaultPath: string = this.app.vault.adapter.basePath;
    const mediaTiddlers = selectedMediaFiles
      .map((mediaFile) => ({
        extension: path.extname(mediaFile.path),
        filePath: path.join(obsidianVaultPath, mediaFile.path),
        mimeType: getMimeTypeFromFilePath(mediaFile.path),
        creationDate: new Date(mediaFile.stat.ctime),
        lastModifiedDate: new Date(mediaFile.stat.mtime),
      }))
      .map(convertMediaFileToBase64Object)
      .map(convertBase64ObjectToTiddler);

    return {
      tiddlers: [...noteTiddlers, ...mediaTiddlers],
      brokenLinkCount,
    };
  }

  private resolveObsidianLinkPath(
    linkPath: string,
    sourcePath: string,
  ): string | null {
    if (linkPath === '') {
      return sourcePath;
    }

    return (
      this.app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath)?.path ??
      null
    );
  }

  private downloadExport(tiddlers: Tiddler[]): void {
    this.triggerDownloadModalForJSON(tiddlers, 'tiddlywiki-export.json');
    new Notice(`Exported ${tiddlers.length} files to TiddlyWiki JSON.`);
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

  private triggerDownloadModalForJSON(jsonObject: unknown, fileName: string) {
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
