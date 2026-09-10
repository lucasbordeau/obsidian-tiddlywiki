export function createFileInputElement(
  pluginContainerElement: HTMLElement,
): HTMLInputElement {
  const input = pluginContainerElement.createEl('input');

  input.type = 'file';
  input.id = 'file-upload';
  input.multiple = false;
  input.accept = '.json';

  return input;
}
