import { TiddlerFields } from '@/modules/conversion-core/codecs/tiddlywiki/TiddlerFields';

export function getTiddlerProperties(
  tiddler: TiddlerFields,
): Record<string, string> {
  const fieldEntries = Object.entries(tiddler).filter(
    (fieldEntry): fieldEntry is [string, string] =>
      fieldEntry[0] !== 'text' && fieldEntry[1] !== undefined,
  );

  return Object.fromEntries(fieldEntries);
}
