export function wikiParts(content: string): {
  target: string;
  alias: string | undefined;
} {
  let separator = -1;

  for (let position = 0; position < content.length; position++) {
    if (content[position] === '\\') {
      position++;

      continue;
    }

    if (content[position] === '|') {
      separator = position;

      break;
    }
  }

  const unescape = (value: string): string =>
    value.replace(/\\([\\|\]])/g, '$1');

  if (separator === -1) {
    return { target: unescape(content), alias: undefined };
  }

  return {
    target: unescape(content.slice(0, separator)),
    alias: unescape(content.slice(separator + 1)),
  };
}
