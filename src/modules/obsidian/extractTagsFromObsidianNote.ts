import { collectObsidianTags } from '@/modules/conversion-core/metadata/collectObsidianTags';
import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { readObsidianTags } from '@/modules/conversion-core/metadata/readObsidianTags';
import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';

export function extractTagsFromObsidianNote(note: ObsidianNote): string[] {
  const frontMatterResult = parseObsidianFrontMatter(note.content);

  if (!frontMatterResult.value) {
    return [];
  }

  const propertyTags = readObsidianTags(
    frontMatterResult.value.properties.tags,
  );

  const bodyTags = collectObsidianTags(
    parseObsidian(frontMatterResult.value.body),
  );

  return [...new Set([...propertyTags, ...bodyTags])];
}
