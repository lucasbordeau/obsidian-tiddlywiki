import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';
import { convertTiddlerRawJSONToTiddler } from './converTiddlerRawJSONToTiddler';

export function convertTiddlyWikiJSONToTiddlers(
  tiddlyWikiJSON: any[],
): Tiddler[] {
  const tiddlerRawJSONArray = tiddlyWikiJSON;

  const tiddlers = tiddlerRawJSONArray.map(convertTiddlerRawJSONToTiddler);

  return tiddlers;
}
