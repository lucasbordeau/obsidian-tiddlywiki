export function escapeTiddlyWikiText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(
      /[<>[\]{}|`]/g,
      (character) => '&#' + character.charCodeAt(0) + ';',
    )
    .replace(
      /['/_~^,@$:]/g,
      (character) => '&#' + character.charCodeAt(0) + ';',
    )
    .replace(/-{2,}/g, (dashes) => Array.from(dashes, () => '&#45;').join(''))
    .replace(
      /(^|\n)([!*#;:>-])/g,
      (_, boundary: string, marker: string) =>
        boundary + '&#' + marker.charCodeAt(0) + ';',
    )
    .replace(/\b([A-Z][a-z]+[A-Z][A-Za-z]*)\b/g, '~$1');
}
