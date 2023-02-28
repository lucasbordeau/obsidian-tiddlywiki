import { promises as fs } from "fs";
import * as path from "path";
import { convertTiddlyWikiToMarkdown } from "./convertTiddlyWikiToMarkdown/convertTiddlyWikiToMarkdown";

export type Tiddler = {
	created: string;
	modified: string;
	tags: string;
	text: string;
	title: string;
	type?: string;
};

export type ObsidianMarkdown = {
	frontmatter: {
		tags?: string[];
		created: string;
		modified: string;
	};
	content: string;
	title: string;
};

export class TiddlyWikiToMarkdownService {
	public async convertJsonToTiddlers(filePath: string): Promise<Tiddler[]> {
		const text = await fs.readFile(filePath, "utf-8");
		const json = JSON.parse(text) as Tiddler[]

		return json;
	}

	public convertTiddlyWikiToMarkdown(text: string): string {
		return convertTiddlyWikiToMarkdown(text)
	}

	public convertTiddlerToObsidianMarkdown(tiddler: Tiddler): ObsidianMarkdown {
		const title = tiddler.title.replace(/\//g, "-"); // replace forward slashes with hyphens in filenames
		const markdownText = this.convertTiddlyWikiToMarkdown(tiddler.text);
		const tags = tiddler.tags ? tiddler.tags.split(", ") : [];
		const frontmatter = tags.length ? { tags } : {};
		const created = tiddler.created ? new Date(tiddler.created).toISOString() : new Date().toISOString();
		const modified = tiddler.modified ? new Date(tiddler.modified).toISOString() : created;
		const content = `${markdownText}\n`;
		return { frontmatter, content, title };
	}

	public convertTiddlersToObsidianMarkdown(tiddlers: Tiddler[]): ObsidianMarkdown[] {
		return tiddlers.map((tiddler) => this.convertTiddlerToObsidianMarkdown(tiddler));
	}

	public async writeObsidianMarkdownFiles(markdowns: ObsidianMarkdown[], directoryPath: string): Promise<void> {
		for (const markdown of markdowns) {
			const { frontmatter, content, title } = markdown;
			const fileName = title.replace(/\//g, "-") + ".md"; // replace forward slashes with hyphens in filenames
			const frontmatterText = frontmatter.tags ? `tags: ${frontmatter.tags.join(", ")}\n` : "";
			const created = frontmatter.created ? frontmatter.created : new Date().toISOString();
			const modified = frontmatter.modified ? frontmatter.modified : created;
			const metadata = `---\ntitle: ${title}\n${frontmatterText}created: ${created}\nmodified: ${modified}\n---\n\n`;
			const filePath = path.join(directoryPath, fileName);
			await fs.writeFile(filePath, metadata + content);
		}
	}
}
