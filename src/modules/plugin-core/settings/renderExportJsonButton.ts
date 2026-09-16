import { App } from 'obsidian';
import { ExportSelectionController } from '@/modules/plugin-core/settings/ExportSelectionController';

export function renderExportJsonButton(
  app: App,
  pluginContainerElement: HTMLElement,
): void {
  const exportSelectionController = new ExportSelectionController(
    app,
    pluginContainerElement,
  );

  exportSelectionController.render();
}
