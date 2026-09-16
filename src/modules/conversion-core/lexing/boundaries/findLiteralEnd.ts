/**
 * Find the next exact literal delimiter, including it in the returned end offset.
 * An unfinished literal extends to the end of the source.
 *
 * ```ts
 * const source = '`a` after';
 * const end = findLiteralEnd(source, 1, '`'); // 3
 * source.slice(0, end); // '`a`'
 * findLiteralEnd('`unfinished', 1, '`'); // 11 (source length)
 *
 * const wikiAttribute = '"""a > b""" [img[photo.png]]';
 * const attributeEnd = findLiteralEnd(wikiAttribute, 3, '"""');
 * wikiAttribute.slice(0, attributeEnd); // '"""a > b"""'
 * // The image scanner can resume at the space after this TiddlyWiki attribute.
 * ```
 */
export function findLiteralEnd(
  source: string,
  start: number,
  delimiter: string,
): number {
  const closing = source.indexOf(delimiter, start);

  return closing < 0 ? source.length : closing + delimiter.length;
}
