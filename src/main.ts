import { Plugin } from 'obsidian';
import { ObsidianTiddlyWikiSettingsTab } from './modules/plugin-core/ObsidianTiddlyWikiPlugin';

export default class ObsidianTiddlyWikiPlugin extends Plugin {
  async onload() {
    this.addSettingTab(new ObsidianTiddlyWikiSettingsTab(this.app, this));
  }
}
