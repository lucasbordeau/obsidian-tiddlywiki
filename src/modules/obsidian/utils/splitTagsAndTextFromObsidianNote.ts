import { collectObsidianTags } from '../../conversion-core/codecs/collectObsidianTags';
import { parseObsidianFrontMatter } from '../../conversion-core/codecs/parseObsidianFrontMatter';
import { readObsidianTags } from '../../conversion-core/codecs/readObsidianTags';
import { parseObsidian } from '../../conversion-core/markdown/parseObsidian';
import { ObsidianNote } from '../types/ObsidianNote';

export function extractTagsFromObsidianNote(note: ObsidianNote): string[] {
  const parsed = parseObsidianFrontMatter(note.content);
  if (!parsed.value) {
    return [];
  }
  const propertyTags = readObsidianTags(parsed.value.properties.tags);
  const bodyTags = collectObsidianTags(parseObsidian(parsed.value.body));
  return [...new Set([...propertyTags, ...bodyTags])];
}
