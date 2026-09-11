export function convertBase64ToFileObject(
  base64String: string,
  fileName: string,
  mimeType: string,
): File {
  const buffer = Buffer.from(base64String, 'base64');

  const blob = new Blob([buffer], { type: mimeType });

  return new File([blob], fileName, { type: mimeType });
}
