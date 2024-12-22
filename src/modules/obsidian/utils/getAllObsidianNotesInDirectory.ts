import * as fs from 'fs';
import * as path from 'path';
import { ObsidianNote } from 'src/modules/obsidian/types/ObsidianNote';

export function getAllObsidianNotesInDirectory(
  directoryPath: string,
): ObsidianNote[] {
  const files = fs.readdirSync(directoryPath);

  const obsidianNotes: ObsidianNote[] = [];

  for (const file of files) {
    if (file.startsWith('.')) {
      // Ignore hidden folders and files
      continue;
    }

    const filePath = path.join(directoryPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      // Recurse into subdirectory
      const obsidianNotesInSubdirectory =
        getAllObsidianNotesInDirectory(filePath);

      obsidianNotes.push(...obsidianNotesInSubdirectory);
    } else if (path.extname(filePath) === '.md') {
      // Parse only .md files
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const obsidianNote: ObsidianNote = {
        title: path.basename(filePath, '.md'),
        content: fileContent,
      };

      obsidianNotes.push(obsidianNote);
    }
  }

  return obsidianNotes;
}
