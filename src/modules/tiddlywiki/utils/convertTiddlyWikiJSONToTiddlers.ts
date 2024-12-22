import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';

export function convertTiddlyWikiJSONToTiddlers(
  tiddlyWikiJSON: any[],
): Tiddler[] {
  const tiddlers = tiddlyWikiJSON;
  console.log({ tiddlers });

  return [];
}
