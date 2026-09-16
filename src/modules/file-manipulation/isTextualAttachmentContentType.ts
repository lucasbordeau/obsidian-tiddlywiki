export function isTextualAttachmentContentType(
  mimeType: string,
  fileName: string,
): boolean {
  const contentType = mimeType.split(';')[0].trim().toLowerCase();

  const isNativeTextFile =
    (/\.base$/i.test(fileName) && contentType === 'text/plain') ||
    (/\.canvas$/i.test(fileName) && contentType === 'application/json');

  const isStructuredText =
    contentType === 'application/json' ||
    contentType.endsWith('+json') ||
    contentType === 'application/javascript' ||
    contentType === 'application/xml' ||
    contentType.endsWith('+xml') ||
    contentType === 'application/x-tiddler-dictionary' ||
    contentType === 'image/svg+xml';

  return (
    isNativeTextFile || contentType.startsWith('text/') || isStructuredText
  );
}
