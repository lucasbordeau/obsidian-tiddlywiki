import * as fs from 'fs';
import * as path from 'path';
import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';

export async function writeObsidianNotesToDirectory(
  obsidianNotes: ObsidianNote[],
  directoryPath: string,
) {
  fs.mkdirSync(directoryPath, { recursive: true });

  for (const obsidianNote of obsidianNotes) {
    const fileName = `${obsidianNote.title}.md`.replace(/[/:\\]/g, '');

    fs.writeFileSync(
      path.join(directoryPath, fileName),
      obsidianNote.content,
      'utf-8',
    );
  }
}
