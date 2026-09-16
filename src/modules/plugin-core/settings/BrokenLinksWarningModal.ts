import { App, Modal, Setting } from 'obsidian';

export class BrokenLinksWarningModal extends Modal {
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
