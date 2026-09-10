export function literalEnd(
  source: string,
  start: number,
  delimiter: string,
): number {
  const closing = source.indexOf(delimiter, start);

  return closing < 0 ? source.length : closing + delimiter.length;
}
