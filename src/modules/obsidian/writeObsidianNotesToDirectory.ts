import { DataWriteOptions, Vault } from 'obsidian';
import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';

export async function writeObsidianNotesToDirectory(
  vault: Vault,
  obsidianNotes: ObsidianNote[],
  directoryPath: string,
): Promise<void> {
  for (const obsidianNote of obsidianNotes) {
    const fileName = `${obsidianNote.title}.md`.replace(/[/:\\]/g, '');
    const filePath = `${directoryPath}/${fileName}`;
    const writeOptions: DataWriteOptions = {};

    if (obsidianNote.creationTimeMs !== undefined) {
      writeOptions.ctime = obsidianNote.creationTimeMs;
    }

    if (obsidianNote.modificationTimeMs !== undefined) {
      writeOptions.mtime = obsidianNote.modificationTimeMs;
    }

    await vault.create(filePath, obsidianNote.content, writeOptions);
  }
}
