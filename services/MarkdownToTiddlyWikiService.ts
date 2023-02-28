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

export function convertMarkdownToTiddlyWiki(text: string): string {
	let twText = text;

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
		return '\t'.repeat(level - 1) + '*'.repeat(match[2].length) + match[3] + match[4];
	}).join('\n');

	// Replace Ordered Lists
	twText = twText.split('\n').map((line) => {
		const match = line.match(/^( *)(\d+)\.( +)(.*)$/);
		if (!match) {
			return line;
		}
		const level = (match[1].replace(/\t/g, '    ').length / 4) + 1;
		const prefix = '#'.repeat(level);
		return prefix + match[3] + match[4];
	}).join('\n');

	// Replace Links
	twText = twText.replace(/\[\[([^\]]+)\]\]/g, (match, p1) => {
		const linkRegex = /((?:[^\[\]|\\]|\\.)+)(?:\|((?:[^\[\]|\\]|\\.)+))?/;
		const linkMatch = linkRegex.exec(p1);

		if (!linkMatch) return match;

		const linkElement1 = linkMatch[1];
		const linkElement2 = linkMatch[2] ? linkMatch[2] : '';

		// Remove leading | character if there is no description
		return `[[${linkElement2 ? `${linkElement2}|` : ''}${linkElement1}]]`;
	});

	// Replace Bold
	twText = twText.replace(/\*\*([^*]+)\*\*/g, "''$1''");

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
