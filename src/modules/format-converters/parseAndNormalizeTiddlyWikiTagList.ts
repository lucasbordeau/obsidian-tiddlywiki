import { normalizeObsidianTags } from '../conversion-core/metadata/tags/obsidian/normalization/normalizeObsidianTags';
import { parseTiddlyWikiTags } from '../conversion-core/metadata/tags/tiddlywiki/parsing/parseTiddlyWikiTags';

export function parseAndNormalizeTags(tagList: string): string {
  return Object.keys(normalizeObsidianTags(parseTiddlyWikiTags(tagList))).join(
    ' ',
  );
}
