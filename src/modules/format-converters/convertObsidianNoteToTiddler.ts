import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';
import { exportObsidianNote } from '@/modules/conversion-core/notes/exportObsidianNote';

export function convertObsidianNoteToTiddler(note: ObsidianNote): Tiddler {
  const exportResult = exportObsidianNote(note);

  if (!exportResult.value) {
    throw new Error(
      exportResult.diagnostics
        .map((diagnostic) => diagnostic.message)
        .join('\n'),
    );
  }

  return exportResult.value;
}
