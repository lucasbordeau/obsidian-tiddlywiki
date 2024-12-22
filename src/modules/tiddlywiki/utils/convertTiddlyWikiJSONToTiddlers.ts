import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';

export function convertTiddlyWikiJSONToTiddlers(
  tiddlyWikiJSON: any[],
): Tiddler[] {
  const tiddlerRawJSONArray = tiddlyWikiJSON;

  return tiddlerRawJSONArray;
}
