import { normalizeObsidianTags } from '@/modules/conversion-core/metadata/normalizeObsidianTags';
import { parseTiddlyWikiTags } from '@/modules/conversion-core/metadata/parseTiddlyWikiTags';

export function parseAndNormalizeTiddlyWikiTagList(tagList: string): string {
  return Object.keys(normalizeObsidianTags(parseTiddlyWikiTags(tagList))).join(
    ' ',
  );
}
