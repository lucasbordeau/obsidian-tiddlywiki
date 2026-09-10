export function markdownTitle(title: string | undefined): string {
  if (title === undefined) {
    return '';
  }

  return ` "${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '&#10;')}"`;
}
