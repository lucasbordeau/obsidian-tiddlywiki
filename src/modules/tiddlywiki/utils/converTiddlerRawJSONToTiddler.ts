import { Tiddler } from '../types/Tiddler';
import { getTiddlerTypeFromTiddlerRawJSON } from './getTiddlerTypeFromTiddlerRawJSON';

export function convertTiddlerRawJSONToTiddler(tiddlerRawJSON: any): Tiddler {
  return {
    title: tiddlerRawJSON.title,
    text: tiddlerRawJSON.text,
    tags: tiddlerRawJSON.tags,
    created: tiddlerRawJSON.created,
    modified: tiddlerRawJSON.modified,
    type: getTiddlerTypeFromTiddlerRawJSON(tiddlerRawJSON),
  };
}
