import { App, ButtonComponent, Notice, Setting } from 'obsidian';
import { buildExportTreeNodes } from '@/modules/export-selection/buildExportTreeNodes';
import { ExportTreeNode } from '@/modules/export-selection/ExportTreeNode';
import { getExportFilePaths } from '@/modules/export-selection/getExportFilePaths';
import { getExportTreeSelectionState } from '@/modules/export-selection/getExportTreeSelectionState';
import { prepareExport } from '@/modules/export-selection/prepareExport';
import { updateExportTreeSelection } from '@/modules/export-selection/updateExportTreeSelection';
import { BrokenLinksWarningModal } from '@/modules/plugin-core/settings/BrokenLinksWarningModal';
import { downloadExport } from '@/modules/plugin-core/settings/downloadExport';

type ExportTreeCheckbox = {
  checkbox: HTMLInputElement;
  exportTreeNode: ExportTreeNode;
};

export class ExportSelectionController {
  private exportTreeNodes: ExportTreeNode[] = [];
  private selectedExportFilePaths = new Set<string>();
  private exportTreeCheckboxes: ExportTreeCheckbox[] = [];
  private exportSummaryElement?: HTMLElement;
  private exportButton?: ButtonComponent;

  constructor(
    private readonly app: App,
    private readonly pluginContainerElement: HTMLElement,
  ) {}

  render(): void {
    this.pluginContainerElement.createEl('h2', { text: 'Export' });

    this.exportTreeNodes = buildExportTreeNodes(
      this.app.vault.getRoot().children,
    );

    this.selectedExportFilePaths = new Set(
      this.exportTreeNodes.flatMap(getExportFilePaths),
    );

    this.exportTreeCheckboxes = [];

    this.renderSelectionActions();
    this.renderExportTree();

    this.exportSummaryElement = this.pluginContainerElement.createEl('p', {
      cls: 'tiddlywiki-export-summary',
      attr: { 'aria-live': 'polite' },
    });

    this.renderExportAction();
    this.updateSelectionUi();
  }

  private renderSelectionActions(): void {
    new Setting(this.pluginContainerElement)
      .setName('Choose files and folders')
      .setDesc('Folder selections include every visible file inside them.')
      .addButton((button) =>
        button.setButtonText('Select all').onClick(() => {
          this.selectedExportFilePaths = new Set(
            this.exportTreeNodes.flatMap(getExportFilePaths),
          );

          this.updateSelectionUi();
        }),
      )
      .addButton((button) =>
        button.setButtonText('Clear').onClick(() => {
          this.selectedExportFilePaths = new Set();

          this.updateSelectionUi();
        }),
      );
  }

  private renderExportTree(): void {
    const exportTreeElement = this.pluginContainerElement.createDiv({
      cls: 'tiddlywiki-export-tree',
      attr: { 'aria-label': 'Files and folders to export' },
    });

    const exportTreeList = exportTreeElement.createEl('ul');

    for (const exportTreeNode of this.exportTreeNodes) {
      this.renderExportTreeNode(exportTreeList, exportTreeNode);
    }
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

      this.updateSelectionUi();
    });

    this.exportTreeCheckboxes.push({ checkbox, exportTreeNode });
  }

  private renderExportAction(): void {
    new Setting(this.pluginContainerElement)
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
          .onClick(() => this.handleExportButtonClick());
      });
  }

  private updateSelectionUi(): void {
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
    const selectedFileLabel = selectedExportFileCount === 1 ? 'file' : 'files';

    this.exportSummaryElement?.setText(
      `${selectedExportFileCount} of ${totalExportFileCount} ${selectedFileLabel} selected. Broken links will be checked before download.`,
    );

    this.exportButton?.setDisabled(selectedExportFileCount === 0);
  }

  private async handleExportButtonClick(): Promise<void> {
    this.exportButton?.setDisabled(true).setButtonText('Preparing…');

    try {
      const preparedExport = await prepareExport(
        this.app,
        this.selectedExportFilePaths,
      );

      if (preparedExport.brokenLinkCount > 0) {
        new BrokenLinksWarningModal(
          this.app,
          preparedExport.brokenLinkCount,
          () => downloadExport(preparedExport.tiddlers),
        ).open();
      } else {
        downloadExport(preparedExport.tiddlers);
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
}
