export function renderPluginHeader(pluginContainerElement: HTMLElement): void {
  pluginContainerElement.empty();

  pluginContainerElement.createEl('h1', { text: 'Import / Export' });
}
