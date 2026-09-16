import { convertText } from '@/modules/conversion-core/conversion/convertText';

export function convertObsidianNoteContentToTiddlerContent(
  content: string,
): string {
  return convertText(content, 'obsidian', 'tiddlywiki').text;
}
