import type { App } from 'obsidian';
import { PluginSettingTab } from 'obsidian';
import type ObsidianTiddlyWikiPlugin from '../../../main';
import { renderPluginHeader } from './renderPluginHeader';
import { renderImportJsonButton } from './renderImportJsonButton';
import { renderExportJsonButton } from './renderExportJsonButton';

export class ObsidianTiddlyWikiSettingsTab extends PluginSettingTab {
  plugin: ObsidianTiddlyWikiPlugin;

  constructor(app: App, plugin: ObsidianTiddlyWikiPlugin) {
    super(app, plugin);

    this.plugin = plugin;
  }

  display(): void {
    const pluginContainerElement = this.containerEl;

    renderPluginHeader(pluginContainerElement);

    renderImportJsonButton(this.app, pluginContainerElement);

    renderExportJsonButton(this.app, pluginContainerElement);
  }
}
