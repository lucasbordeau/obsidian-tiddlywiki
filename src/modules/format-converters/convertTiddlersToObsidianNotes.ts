import { importTiddler } from '../conversion-core/notes/importTiddler';
import { ObsidianNote } from '../obsidian/ObsidianNote';
import { Tiddler } from '../tiddlywiki/Tiddler';

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
