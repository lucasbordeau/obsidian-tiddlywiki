import { collectObsidianTags } from '../conversion-core/metadata/collectObsidianTags';
import { parseObsidianFrontMatter } from '../conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { readObsidianTags } from '../conversion-core/metadata/readObsidianTags';
import { parseObsidian } from '../conversion-core/syntax/obsidian/parsing/parseObsidian';
import { ObsidianNote } from './ObsidianNote';

export function extractTagsFromObsidianNote(note: ObsidianNote): string[] {
  const parsed = parseObsidianFrontMatter(note.content);

  if (!parsed.value) {
    return [];
  }

  const propertyTags = readObsidianTags(parsed.value.properties.tags);
  const bodyTags = collectObsidianTags(parseObsidian(parsed.value.body));

  return [...new Set([...propertyTags, ...bodyTags])];
}
