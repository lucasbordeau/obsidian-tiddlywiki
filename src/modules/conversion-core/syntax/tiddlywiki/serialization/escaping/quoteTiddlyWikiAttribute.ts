export function quoteTiddlyWikiAttribute(value: string): string | undefined {
  if (!value.includes('"')) {
    return '"' + value + '"';
  }

  if (!value.includes("'")) {
    return "'" + value + "'";
  }

  if (!value.includes('"""')) {
    return '"""' + value + '"""';
  }

  return undefined;
}
