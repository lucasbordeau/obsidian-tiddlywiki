import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';

export function extractTagsFromObsidianNote(note: ObsidianNote): string[] {
  const tagRegex = /(^|\s)#([\w-]+)/g;

  const extractedTags: string[] = [];

  for (const match of note.content.matchAll(tagRegex)) {
    extractedTags.push(match[2]); // Extract the tag without the hash (#)
  }

  return [...new Set(extractedTags)];
}
