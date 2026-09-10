import { importTiddler } from '../conversion-core/notes/import/importTiddler';
import { ObsidianNote } from '../obsidian/types/ObsidianNote';
import { Tiddler } from '../tiddlywiki/types/Tiddler';

export function convertTiddlersToObsidianNotes(
  tiddlers: Tiddler[],
): ObsidianNote[] {
  return tiddlers.map((tiddler) => {
    const result = importTiddler(tiddler);

    if (!result.value) {
      throw new Error(
        result.diagnostics.map((diagnostic) => diagnostic.message).join('\n'),
      );
    }

    return result.value;
  });
}
