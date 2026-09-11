import { normalizeObsidianTags } from '../conversion-core/metadata/normalizeObsidianTags';
import { parseTiddlyWikiTags } from '../conversion-core/metadata/parseTiddlyWikiTags';

export function parseAndNormalizeTags(tagList: string): string {
  return Object.keys(normalizeObsidianTags(parseTiddlyWikiTags(tagList))).join(
    ' ',
  );
}
