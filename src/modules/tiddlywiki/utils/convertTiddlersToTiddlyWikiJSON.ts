import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';
import { TiddlyWikiJSON } from 'src/modules/tiddlywiki/types/TiddlyWikiJSON';

export function convertTiddlersToTiddlyWikiJSON(
  tiddlers: Tiddler[],
): TiddlyWikiJSON {
  const jsonData = {
    fields: ['title', 'text', 'tags', 'created', 'modified'],
    data: tiddlers.map((tiddler) => Object.values(tiddler)),
  };

  return jsonData;
}
