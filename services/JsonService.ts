import * as path from 'path';
import { convertTiddlyWikiToMarkdown } from './convertTiddlyWikiToMarkdown/convertTiddlyWikiToMarkdown';
import { parseTiddlersFromFile } from './parseTiddlersFromFile';
import { ObsidianMarkdown, Tiddler } from './types';
const { promises: fs } = require("fs");

export async function writeObsidianMarkdownsToFiles(markdowns: ObsidianMarkdown[], directoryPath: string) {
	for (let i = 0; i < markdowns.length; i++) {
		const markdown = markdowns[i];
		const filename = `${markdown.title}.md`;
		const fileContent = `---\ntitle: ${markdown.title}\ntags: ${markdown.frontmatter.tags?.join(", ")}\n---\n\n${markdown.content}`;
		const filePath = path.join(directoryPath, filename);

		console.log(filePath)

		await fs.writeFile(filePath, fileContent);
	}
}

export function convertTiddlersToObsidianMarkdown(tiddlers: Tiddler[]): string[] {
	const markdownArray = [];
	for (const tiddler of tiddlers) {
		const frontMatter = `---\n`
			+ `title: ${tiddler.title}\n`
			+ `${tiddler.tags ? `tags: ${tiddler.tags}\n` : ''}`
			+ `created: ${tiddler.created}\n`
			+ `modified: ${tiddler.modified}\n`
			+ `---\n`;
		const obsidianMarkdown = frontMatter + convertTiddlyWikiToMarkdown(tiddler.text);
		markdownArray.push(obsidianMarkdown);
	}
	return markdownArray;
}


export async function convertJsonTiddlersToMarkdownFiles(inputJsonFile: File | undefined | null, outputDirectory: string) {
	if (!inputJsonFile) {
		throw new Error('File is not defined')
	}

	const tiddlers = await parseTiddlersFromFile(inputJsonFile)

	console.log({ tiddlers })

	const obsidianMarkdownList = convertTiddlersToObsidianMarkdown(tiddlers)

	console.log({ obsidianMarkdown: obsidianMarkdownList })

	await writeObsidianMarkdownsToFiles(obsidianMarkdownList, outputDirectory)
}


