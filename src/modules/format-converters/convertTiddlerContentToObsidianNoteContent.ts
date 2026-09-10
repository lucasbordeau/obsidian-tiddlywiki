import { convertText } from '../conversion-core/conversion/convertText';

export function convertTiddlerContentToObsidianNoteContent(
  content: string,
): string {
  return convertText(content, 'tiddlywiki', 'obsidian').text;
}
