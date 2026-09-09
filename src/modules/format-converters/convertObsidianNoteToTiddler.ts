import { ObsidianNote } from '../obsidian/types/ObsidianNote';
import { Tiddler } from '../tiddlywiki/types/Tiddler';
import { exportObsidianNote } from '../conversion-core/codecs/exportObsidianNote';

export function convertObsidianNoteToTiddler(note: ObsidianNote): Tiddler {
  const result = exportObsidianNote(note);
  if (!result.value) {
    throw new Error(
      result.diagnostics.map((diagnostic) => diagnostic.message).join('\n'),
    );
  }
  return result.value;
}
