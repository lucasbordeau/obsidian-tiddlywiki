export function isMarkdownContentType(
  contentType: string | undefined,
): boolean {
  return contentType === 'text/x-markdown' || contentType === 'text/markdown';
}
