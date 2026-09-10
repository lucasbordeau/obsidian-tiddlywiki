export function escapeTablePipes(source: string): string {
  return source.replace(/(^|[^\\])((?:\\\\)*)\|/g, '$1$2\\|');
}
