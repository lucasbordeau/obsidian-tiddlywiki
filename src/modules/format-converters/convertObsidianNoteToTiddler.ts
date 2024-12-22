import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';
import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';
import { splitTagsAndTextFromObsidianNote } from '../obsidian/utils/splitTagsAndTextFromObsidianNote';
import { convertObsidianNoteContentToTiddlerContent } from './convertObsidianNoteContentToTiddlerContent';

export function convertObsidianNoteToTiddler(
  obsidianNote: ObsidianNote,
): Tiddler {
  const frontMatterRegex = /^---\n([\s\S]*?)---\n/;
  const frontMatterMatch = obsidianNote.content.match(frontMatterRegex);

  const tags = [];

  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    const tagsMatch = frontMatter.match(/^tags:\s+(.+)$/m);
    if (tagsMatch) {
      tags.push(tagsMatch[1]);
    }
  }

  const { tags: tagsFromText, textWithoutTags } =
    splitTagsAndTextFromObsidianNote(obsidianNote);

  tags.push(...tagsFromText);

  const tiddlerContent =
    convertObsidianNoteContentToTiddlerContent(textWithoutTags);

  const created = new Date().toISOString();
  const modified = created;

  return {
    title: obsidianNote.title,
    text: tiddlerContent,
    tags: tags.join(' '),
    created,
    modified,
  };
}
