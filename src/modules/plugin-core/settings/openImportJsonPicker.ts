import type { App } from 'obsidian';
import { importSelectedFiles } from './importSelectedFiles';

export function openImportJsonPicker(app: App): void {
  const input = document.createElement('input');

  input.type = 'file';
  input.multiple = false;
  input.accept = '.json';
  input.addEventListener('change', () => importSelectedFiles(app, input));

  input.click();
}
