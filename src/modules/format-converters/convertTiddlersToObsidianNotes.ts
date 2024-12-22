import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';
import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';
import { convertTiddlerContentToObsidianNoteContent } from './convertTiddlerContentToObsidianNoteContent';

export function convertTiddlersToObsidianNotes(tiddlers: Tiddler[]) {
  const obsidianNotes: ObsidianNote[] = [];

  for (const tiddler of tiddlers) {
    const frontMatter =
      `---\n` + `${tiddler.tags ? `tags: ${tiddler.tags}\n` : ''}` + `---\n`;

    const content =
      frontMatter + convertTiddlerContentToObsidianNoteContent(tiddler.text);

    obsidianNotes.push({
      content,
      title: tiddler.title,
    });
  }
  return obsidianNotes;
}
