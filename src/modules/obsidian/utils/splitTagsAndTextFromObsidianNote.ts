import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';

export function splitTagsAndTextFromObsidianNote(note: ObsidianNote): {
  tags: string[];
  textWithoutTags: string;
} {
  const tagRegex = /(^|\s)#([\w-]+)/g;

  const extractedTags: string[] = [];

  const textWithoutTags = note.content
    .replace(tagRegex, (match, p1, p2) => {
      extractedTags.push(p2);
      return p1;
    })
    .trim();

  return { tags: [...new Set(extractedTags)], textWithoutTags };
}
