export function escapeText(value: string): string {
  return value
    .replace(/[\\`*_[\]<>!#~|=$%^&]/g, '\\$&')
    .replace(/^(\d+)([.)])(?=[ \t])/gm, '$1\\$2')
    .replace(/^([-+])(?=[ \t])/gm, '\\$1');
}
