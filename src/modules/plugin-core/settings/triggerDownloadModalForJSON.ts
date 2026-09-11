export function triggerDownloadModalForJSON(
  jsonObject: unknown,
  fileName: string,
): void {
  const jsonString = JSON.stringify(jsonObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');

  downloadLink.href = url;
  downloadLink.download = fileName;

  downloadLink.click();

  URL.revokeObjectURL(url);
}
