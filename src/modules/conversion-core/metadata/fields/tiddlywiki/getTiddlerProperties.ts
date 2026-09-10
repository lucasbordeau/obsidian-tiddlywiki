import type { TiddlerFields } from '../../../codecs/tiddlywiki/fields/types/TiddlerFields';

export function getTiddlerProperties(
  tiddler: TiddlerFields,
): Record<string, string> {
  const fieldEntries = Object.entries(tiddler).filter(
    (entry): entry is [string, string] =>
      entry[0] !== 'text' && entry[1] !== undefined,
  );

  return Object.fromEntries(fieldEntries);
}
