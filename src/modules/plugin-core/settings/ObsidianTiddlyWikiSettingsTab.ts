import { App } from 'obsidian';
import { PluginSettingTab } from 'obsidian';
import ObsidianTiddlyWikiPlugin from '@/main';
import { renderPluginHeader } from '@/modules/plugin-core/settings/renderPluginHeader';
import { renderImportJsonButton } from '@/modules/plugin-core/settings/renderImportJsonButton';
import { renderExportJsonButton } from '@/modules/plugin-core/settings/renderExportJsonButton';

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
