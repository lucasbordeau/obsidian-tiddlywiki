import * as fs from "fs";
import * as path from "path";

export interface Tiddler {
	title: string;
	text: string;
	tags?: string;
	created: string;
	modified: string;
}

export type ObsidianMarkdown = {
	title: string;
	content: string
}

export async function convertJSONToTiddlers(file: File): Promise<Tiddler[]> {
	const fileReader = new FileReader();

	return new Promise((resolve, reject) => {
		fileReader.onload = () => {
			const tiddlers: Tiddler[] = JSON.parse(fileReader.result as string);
			resolve(tiddlers);
		};
		fileReader.onerror = () => {
			reject(fileReader.error);
		};
		fileReader.readAsText(file, 'UTF-8');
	});
}

export function convertTiddlersToObsidianMarkdown(tiddlers: Tiddler[]) {
	const markdownArray: ObsidianMarkdown[] = [];

	for (const tiddler of tiddlers) {
		const frontMatter = `---\n`
			+ `${tiddler.tags ? `tags: ${tiddler.tags}\n` : ''}`
			+ `---\n`;

		const content = frontMatter + convertTiddlyWikiToMarkdown(tiddler.text);

		markdownArray.push({
			content,
			title: tiddler.title
		});
	}
	return markdownArray;
}

export async function writeObsidianMarkdownFiles(markdownArray: ObsidianMarkdown[], directoryPath: string) {
	fs.mkdirSync(directoryPath, { recursive: true });

	for (const markdownFile of markdownArray) {
		const fileName = `${markdownFile.title}.md`.replace(/[\/\:\\]/g, '');

		fs.writeFileSync(path.join(directoryPath, fileName), markdownFile.content, 'utf-8');
	}
}

export function convertTiddlyWikiToMarkdown(text: string): string {
	let markdownText = text;

	// Replace Quote Block
	markdownText = markdownText.replace(/<<<\n?([\s\S]+?)\n?<<<\n?([\s\S]*?)(?=\n?<<<|\n?$)/g, (match, p1, p2) => {
		const quote = p1.split("\n").map((line: string) => `> ${line}`).join("\n") + "\n";
		const remainingText = p2.trim() ? p2 : "";
		return `${quote}${remainingText}`;
	});

	const lines = markdownText.split("\n");
	const markdownLines = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Replace Unordered Lists
		let convertedLine = line.replace(/^(\s*)(\*+)(\s+)/g, (match, p1, p2, p3) => {
			const level = p1.replace(/\t/g, "    ").length / 4 + 1;
			return "  ".repeat(level - 1) + "-".repeat(p2.length) + p3;
		});

		// Replace Ordered Lists
		convertedLine = convertedLine.replace(/^(\s*)(#+)(\s+)/g, (match, p1, p2, p3) => {
			return p2.replace(/#/g, "1.") + p3;
		});

		// Replace Links 
		convertedLine = convertedLine.replace(/\[\[(.+?)]]/g, (_, match) => {
			const linkRegex = /([^\]|]+)(?:\|([^\]]+))?/;

			const linkMatch = linkRegex.exec(match);
			if (!linkMatch) return match;

			let linkElement1 = linkMatch[1];
			let linkElement2 = linkMatch[2];

			// Replace any remaining /, \, or : characters with underscores
			linkElement1 = linkElement1.replace(/[\/\:]/g, "_");
			if (linkElement2) {
				linkElement2 = linkElement2.replace(/[\/\:]/g, "_");
			}

			// Swap
			return "[[" + (linkElement2 ? linkElement2 + "|" + linkElement1 : linkElement1) + "]]";
		});


		// Replace Bold
		convertedLine = convertedLine.replace(/''(.+?)''/g, "**$1**");

		// Replace Italic
		convertedLine = convertedLine.replace(/\/\/(.+?)\/\//g, "_$1_");

		// Replace Underline
		convertedLine = convertedLine.replace(/__(.+?)__/g, "<u>$1</u>");

		// Replace Headings
		convertedLine = convertedLine.replace(/^(!{1,6})(\s+)(.+)/g, (match, p1, p2, p3) => {
			const level = p1.length;
			return "#".repeat(level) + p2 + p3;
		});

		// Replace Images
		convertedLine = convertedLine.replace(/\[img\[(.+?)\]\]/g, "![[$1]]");

		markdownLines.push(convertedLine);
	}

	return markdownLines.join("\n");
}

