export function createUploadFormContainer(
  pluginContainerElement: HTMLElement,
): HTMLFormElement {
  return pluginContainerElement.createEl('form', {
    attr: { encType: 'multipart/form-data', hidden: true },
  });
}
