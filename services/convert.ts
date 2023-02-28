import * as fs from 'fs';
import * as path from 'path';
import { convertTiddlyWikiToMarkdown } from './convertTiddlyWikiToMarkdown/convertTiddlyWikiToMarkdown';

interface Tiddler {
	title: string;
	text: string;
	tags?: string;
	created: string;
	modified: string;
}

// 1. Convert JSON file to array of Tiddlers
export function convertJSONToTiddlers(file: File): Tiddler[] {
	const fileReader = new FileReader();
	fileReader.readAsText(file, 'UTF-8');
	const tiddlers: Tiddler[] = JSON.parse(fileReader.result as string);
	return tiddlers;
}

// 3. Convert array of Tiddlers to array of Obsidian Markdown


// 4. Write array of Obsidian Markdown to multiple files in a directory
export function writeObsidianMarkdownFiles(markdownArray: string[], directoryPath: string): void {
	fs.mkdirSync(directoryPath, { recursive: true });
	for (let i = 0; i < markdownArray.length; i++) {
		const fileName = `${i + 1} - ${markdownArray[i].match(/title: (.+)\n/)?.[1]}.md`;
		fs.writeFileSync(path.join(directoryPath, fileName), markdownArray[i], 'utf-8');
	}
}
