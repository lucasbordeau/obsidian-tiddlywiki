import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';
import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';
import { convertTiddlerContentToObsidianNoteContent } from './convertTiddlerContentToObsidianNoteContent';
import { parseAndNormalizeTags } from './parseAndNormalizeTiddlyWikiTagList';

export function convertTiddlersToObsidianNotes(tiddlers: Tiddler[]) {
  const obsidianNotes: ObsidianNote[] = [];

  for (const tiddler of tiddlers) {
    const normalizedTags = parseAndNormalizeTags(tiddler.tags ?? '');

    const frontMatter =
      `---\n` + `${tiddler.tags ? `tags: ${normalizedTags}\n` : ''}` + `---\n`;

    const content =
      frontMatter + convertTiddlerContentToObsidianNoteContent(tiddler.text);

    obsidianNotes.push({
      content,
      title: tiddler.title,
    });
  }
  return obsidianNotes;
}
