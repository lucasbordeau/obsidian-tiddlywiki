import * as fs from 'fs';
import * as path from 'path';
import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';

export async function writeObsidianNotesToDirectory(
  obsidianNotes: ObsidianNote[],
  directoryPath: string,
) {
  for (const obsidianNote of obsidianNotes) {
    const fileName = `${obsidianNote.title}.md`.replace(/[/:\\]/g, '');

    fs.writeFileSync(
      path.join(directoryPath, fileName),
      obsidianNote.content,
      'utf-8',
    );
  }
}
