export function parseTiddlyWikiTags(source: string): string[] {
  const tags: string[] = [];
  const pattern = /\[\[([\s\S]*?)\]\]|([^\s]+)/g;
  for (const match of source.matchAll(pattern)) {
    tags.push(match[1] ?? match[2]);
  }
  return [...new Set(tags)];
}
