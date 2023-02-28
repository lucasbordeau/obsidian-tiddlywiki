import { describe, test, expect } from "@jest/globals"
import { readFileSync } from "fs";
import { convertTiddlyWikiToMarkdown } from "services/convertTiddlyWikiToMarkdown/convertTiddlyWikiToMarkdown";
import { ObsidianMarkdown, Tiddler } from "../services/types";

const tiddlyWikiFilePath = "/Users/lucas/Data/obsidian/.obsidian/plugins/obsidian-tiddlywiki/tests/samples/tiddlywiki.tid";
const markdownFilePath = "/Users/lucas/Data/obsidian/.obsidian/plugins/obsidian-tiddlywiki/tests/samples/obsidian.md";

describe("convertTiddlyWikiToMarkdown", () => {
	it("converts a TiddlyWiki tiddler to Markdown", () => {
		const tiddlyWikiText = readFileSync(tiddlyWikiFilePath, "utf-8");
		const expectedMarkdownText = readFileSync(markdownFilePath, "utf-8");

		expect(convertTiddlyWikiToMarkdown({ text: tiddlyWikiText } as Tiddler)).toEqual(expectedMarkdownText);
	});
});

describe("convertTiddlyWikiToMarkdown", () => {
	test("converts TiddlyWiki formatting to Markdown", () => {
		const tiddler: Tiddler = {
			created: "20230225182510841",
			text: "! Heading 1\n\n* Item 1\n* Item 2\n\n!! Heading 2\n\n{{{/9j/4AAQSkZJRgABAQAAAQABAAD/REBERAREQEREBERAREQf//Z}}}\n\n''Italic''\n'''Bold'''",
			tags: "Test",
			title: "Test Tiddler",
			modified: "20230225182510841",
		};

		const markdown = convertTiddlyWikiToMarkdown(tiddler.text);

		const expectedMarkdown: ObsidianMarkdown = {
			frontmatter: {
				tags: ["Test"],
			},
			title: "Test Tiddler",
			content: "# Heading 1\n\n- Item 1\n- Item 2\n\n## Heading 2\n\n![](/9j/4AAQSkZJRgABAQAAAQABAAD/REBERAREQEREBERAREQf//Z)\n\n_Italic_\n**Bold**",
		};

		expect(markdown).toEqual(expectedMarkdown);
	});
}); 
