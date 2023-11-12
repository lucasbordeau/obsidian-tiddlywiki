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
	content: string;
};

export async function convertObsidianMarkdownToTiddlers(directoryPath: string): Promise<Tiddler[]> {
	const tiddlers: Tiddler[] = [];

	const files = fs.readdirSync(directoryPath);

	for (const file of files) {
		if (file.startsWith('.')) {
			// Ignore hidden folders and files
			continue;
		}

		const filePath = path.join(directoryPath, file);

		if (fs.statSync(filePath).isDirectory()) {
			// Recurse into subdirectory
			const subTiddlers = await convertObsidianMarkdownToTiddlers(filePath);
			tiddlers.push(...subTiddlers);
		} else if (path.extname(filePath) === '.md') {
			// Parse only .md files
			const fileContent = fs.readFileSync(filePath, 'utf-8');
			const tiddler = convertObsidianMarkdownToTiddler(fileContent, file);
			tiddlers.push(tiddler);
		}
	}

	return tiddlers;
}


export function convertObsidianMarkdownToTiddler(content: string, fileName: string): Tiddler {
	const frontMatterRegex = /^---\n([\s\S]*?)---\n/;
	const frontMatterMatch = content.match(frontMatterRegex);

	let tags = [];
	if (frontMatterMatch) {
		const frontMatter = frontMatterMatch[1];
		const tagsMatch = frontMatter.match(/^tags:\s+(.+)$/m);
		if (tagsMatch) {
			tags.push(tagsMatch[1]);
		}
	}

	const title = fileName.replace(/.md$/, "");

	const { tags: tagsFromText, newText } = extractTagsFromMarkdownText(content)

	tags.push(...tagsFromText)

	const text = convertMarkdownToTiddlyWiki(newText);

	const created = new Date().toISOString();
	const modified = created;

	return { title, text, tags: tags.join(' '), created, modified };
}

export function extractTagsFromMarkdownText(text: string): { tags: string[], newText: string } {
	const regex = /(^|\s)#([\w-]+)/g;
	const tags: string[] = [];
	const newText = text.replace(regex, (match, p1, p2) => {
		tags.push(p2);
		return p1;
	}).trim();
	return { tags: [...new Set(tags)], newText };
}

/**
 * Converts a markdown string to a TiddlyWiki string.
 * See the tests in tests/MarkdownToTiddlyWiki.test.ts for examples
 * @param text  content of a markdown file
 * @returns the content of the file converted to TiddlyWiki
 */
export function convertMarkdownToTiddlyWiki(text: string): string {
	// Don't convert text in code blocks, surrounded by ```
	let is_in_code_block = true;
	let twText = text.split(/```/).map((block) => {
		is_in_code_block = !is_in_code_block;
		if (is_in_code_block) {
			return block;
		} else {
			return convertMarkdownNotInACodeBlockToTiddlyWiki(block);
		}
	}).join('```');
	return twText;
}

function convertMarkdownNotInACodeBlockToTiddlyWiki(text: string): string {
	let twText = text;

	// Replace Bold - convert **bold** to ''bold'' before converting unordered list items
	twText = twText.replace(/\*\*([^*]+)\*\*/g, "''$1''");

	// Replace Headings
	twText = twText.replace(/^#+\s+(.*)$/gm, (match, p1) => {
		const level = match.match(/^#+/)?.[0].length ?? 0
		return "!".repeat(level) + ' ' + p1;
	});

	// Replace Unordered Lists
	twText = twText.split('\n').map((line) => {
		const match = line.match(/^( *)(-+)( +)(.*)$/);
		if (!match) {
			return line;
		}
		const level = (match[1].replace(/\t/g, '    ').length / 2) + 1;
		return '*'.repeat(level) + match[3] + match[4];
	}).join('\n');

	// Replace Ordered Lists
	twText = twText.split('\n').map((line) => {
		const match = line.match(/^( *)(\d+)\.( +)(.*)$/);
		if (!match) {
			return line;
		}
		const level = (match[1].replace(/\t/g, '    ').length / 3) + 1;
		const prefix = '#'.repeat(level);
		return prefix + match[3] + match[4];
	}).join('\n');

	// Protect CamelCase words
	twText = twText.replace(/([A-Z][a-z]+[A-Z][A-Za-z]*)/g, "~$1");

	// Replace Internal Links without display text
	twText = twText.replace(/(!?)\[\[([^\]]+)\]\]/g, (match, p0, p1) => {
		p1 = p1.replace('~', '')
		const optImg = p0 === '!' ? 'img' : '';
		const linkRegex = /((?:[^\[\]|\\]|\\.)+)(?:\|((?:[^\[\]|\\]|\\.)+))?/;
		const linkMatch = linkRegex.exec(p1);
		let linkElement1, description: string; 
		if (linkMatch === null) {
			linkElement1 = p1;
			description = '';
		} else {
			linkElement1 = linkMatch[1];
			description = linkMatch[2] ? linkMatch[2] : '';
		}

		// CamelCase links
		if ( linkElement1.match(/^([A-Z][a-z]+[A-Z][A-Za-z]*)$/g) ) {
			return `${linkElement1}`;
		}

		// Remove leading | character if there is no description
		if (description === '') return `[${optImg}[${linkElement1}]]`;
		return `[${optImg}[${description}|${linkElement1}]]`;
	});

	// Replace External Links
	twText = twText.replace(/(!?)\[([^\[\]]+)\]\(([^()]+)\)/g, (match, p0, p1, p2) => {
		const optImg = p0 === '!' ? 'img' : '';
		const linkLabel = p1.replace('~', '')
		const linkElement1 = p2.replace('~', '')
		if ( linkLabel === linkElement1 ) {
			return `[${optImg}[${linkElement1}]]`;
		} else {
			return `[${optImg}[${linkLabel}|${linkElement1}]]`;
		}
	});

	// Replace Italic
	twText = twText.replace(/(\b|[^\\])_(\S|\S.*?\S)_(\b|[^\\])/g, "$1//$2//$3");

	// Replace Underline
	twText = twText.replace(/<u>([^<]+)<\/u>/g, "__$1__");

	// Replace Images
	twText = twText.replace(/!\[\[([^\]]+)\]\]/g, '[img[$1]]');

	// Replace Blockquote
	twText = twText.split('\n').map((line, index, lines) => {
		const match = line.match(/^> (.*)/);
		if (!match) {
			return line;
		}

		// If this is the first line of the blockquote, add <<< before it
		if (index === 0 || lines[index - 1].match(/^\s*$/)) {
			line = `<<<\n${match[1]}`;
		} else {
			line = match[1];
		}

		// If this is the last line of the blockquote, add >>> after it
		if (index === lines.length - 1 || lines[index + 1].match(/^\s*$/)) {
			line += '\n<<<';
		}

		return line;
	}).join('\n');

	return twText;
}


export async function writeTiddlyWikiJSONFile(tiddlers: Tiddler[], filePath: string) {
	const tiddlyWikiData = {
		fields: ["title", "text", "tags", "created", "modified"],
		data: tiddlers.map((tiddler) => Object.values(tiddler)),
	};

	fs.writeFileSync(filePath, JSON.stringify(tiddlyWikiData), "utf-8");
}

export async function exportAllMarkdownFilesToJSON(directoryPath: string): Promise<any[]> {
	const tiddlers = await convertObsidianMarkdownToTiddlers(directoryPath);
	const tiddlerData = tiddlers.map((tiddler: Tiddler) => {
		return {
			title: tiddler.title,
			text: tiddler.text,
			tags: tiddler.tags,
			created: tiddler.created,
			modified: tiddler.modified,
		};
	});
	return tiddlerData;
}
