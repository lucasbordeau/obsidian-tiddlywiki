import { normalizeObsidianTags } from '../conversion-core/codecs/normalizeObsidianTags';
import { parseTiddlyWikiTags } from '../conversion-core/codecs/parseTiddlyWikiTags';

export function parseAndNormalizeTags(tagList: string): string {
  return Object.keys(normalizeObsidianTags(parseTiddlyWikiTags(tagList))).join(
    ' ',
  );
}
