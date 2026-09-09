import { convertText } from '../conversion-core/convertText';

export function convertObsidianNoteContentToTiddlerContent(
  content: string,
): string {
  return convertText(content, 'obsidian', 'tiddlywiki').text;
}
