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

/**
 * Converts a TiddlyWiki tiddler to Markdown using regular expressions.
 * See the test suite in tests/TiddlyWikiToMarkdown.test.ts for examples of the conversion.
 * @param text content of a TiddlyWiki tiddler
 * @returns the content of the tiddler converted to Markdown
 */
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
	let in_code_block = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.match(/^```[-a-z]*/)) {
			in_code_block = !in_code_block;
		}
		// Ignore markup in code blocks
		if (in_code_block) {
			markdownLines.push(line);
			continue;
		}

		// Replace Unordered Lists
		let convertedLine = line.replace(/^(\s*)\*(\**)(\s+)/g, (match, p1, p2, p3) => {
			return p2.replace(/\*/g, "  ") + "-" + p3;
		});

		// Replace Ordered Lists
		convertedLine = convertedLine.replace(/^(\s*)#(#*)(\s+)/g, (match, p1, p2, p3) => {
			return p2.replace(/#/g, "   ") + "1." + p3;
		});

		// CamelCase Links
		convertedLine = convertedLine.replace(/(~?)([A-Z][a-z]+[A-Z][A-Za-z]*)/g, (_, p1, p2) => {
			if ( p1 === "~" ) return p2;
			return '@((@' + p2 + '@))@';
		});

		// Replace Links 
		convertedLine = convertedLine.replace(/\[(|img|ext)\[(.+?)]]/g, (_, p1, match) => {
			match = match.replace(/@\(\(@/g, '');
			match = match.replace(/@\)\)@/g, '');
			const linkRegex = /([^\]|]+)(?:\|([^\]]+))?/;

			const linkMatch = linkRegex.exec(match);
			if (!linkMatch) return match;

			let linkElement1 = linkMatch[1];
			let linkElement2 = linkMatch[2];
			if (!linkElement2 && linkElement1.includes("://")) {
				// If no link text and link contains '://', use link as link text
				linkElement2 = linkElement1;
			}

			// Format link: distinguish between internal and external links
			let	optImg = p1 === "img" ? "!" : "";
			// console.log(`Replace Links: $1: ${p1}, $2: ${linkElement1}, $3: ${linkElement2}`);
			if (!linkElement2) {
				return `${optImg}[[${linkElement1}]]`;
			} else if (linkElement2.includes("://")) {
				return `${optImg}[${linkElement1}](${linkElement2})`;
			} else {
				return `${optImg}[[${linkElement2}|${linkElement1}]]`;
			}
		});

		// Replace temporary '@((@' with '[[' and '@))@' with ']]'
		convertedLine = convertedLine.replace(/@\(\(@/g, '[[');
		convertedLine = convertedLine.replace(/@\)\)@/g, ']]');
		// Replace temporary '@(@' with '[' and '@)@' with ']'
		convertedLine = convertedLine.replace(/@\(@/g, '[');
		convertedLine = convertedLine.replace(/@\)@/g, ']');
		// Replace temporary '@{@' with '(' and '@}@' with ')'
		convertedLine = convertedLine.replace(/@\{@/g, '(');
		convertedLine = convertedLine.replace(/@\}@/g, ')');

		// Replace Bold
		convertedLine = convertedLine.replace(/''(.+?)''/g, "**$1**");

		// Replace Italic
		convertedLine = convertedLine.replace(/([^:])\/\/(.+?)\/\//g, "$1_$2_"); 	// Ignore '://'
		convertedLine = convertedLine.replace(/^\/\/(.+?)\/\//g, "_$1_");

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
