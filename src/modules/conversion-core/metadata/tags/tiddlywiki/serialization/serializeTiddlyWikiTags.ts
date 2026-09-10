export function serializeTiddlyWikiTags(tags: string[]): string {
  return [...new Set(tags)]
    .map((tag) => (/\s/.test(tag) ? `[[${tag}]]` : tag))
    .join(' ');
}
