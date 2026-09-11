import { ObsidianNote } from '../obsidian/ObsidianNote';
import { Tiddler } from '../tiddlywiki/Tiddler';
import { exportObsidianNote } from '../conversion-core/notes/exportObsidianNote';

export function convertObsidianNoteToTiddler(note: ObsidianNote): Tiddler {
  const result = exportObsidianNote(note);

  if (!result.value) {
    throw new Error(
      result.diagnostics.map((diagnostic) => diagnostic.message).join('\n'),
    );
  }

  return result.value;
}
