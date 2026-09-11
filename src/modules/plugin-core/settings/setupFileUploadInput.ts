import type { App } from 'obsidian';
import { importSelectedFiles } from './importSelectedFiles';
import { createFileInputElement } from './createFileInputElement';

export function setupFileUploadInput(
  app: App,
  pluginContainerElement: HTMLElement,
  form: HTMLFormElement,
): HTMLInputElement {
  const input = createFileInputElement(pluginContainerElement);

  input.addEventListener('change', () => importSelectedFiles(app, input));

  form.appendChild(input);

  return input;
}
