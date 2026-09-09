import { convertText } from '../conversion-core/convertText';

export function convertTiddlerContentToObsidianNoteContent(
  content: string,
): string {
  return convertText(content, 'tiddlywiki', 'obsidian').text;
}
