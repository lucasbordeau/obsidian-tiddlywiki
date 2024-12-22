import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';
import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';
import { extractTagsFromObsidianNote } from '../obsidian/utils/splitTagsAndTextFromObsidianNote';
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

  const tagsFromText = extractTagsFromObsidianNote(obsidianNote);

  tags.push(...tagsFromText);

  const tiddlerContent = convertObsidianNoteContentToTiddlerContent(
    obsidianNote.content,
  );

  const created = new Date().toISOString();
  const modified = created;

  return {
    type: 'text',
    title: obsidianNote.title,
    text: tiddlerContent,
    tags: tags.join(' '),
    created,
    modified,
  };
}
