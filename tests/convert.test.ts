import * as path from "path";
import * as fs from "fs";
import { convertTiddlyWikiToMarkdown } from "../services/TiddlyWikiToMarkdownService";
import { convertMarkdownToTiddlyWiki } from "../services/MarkdownToTiddlyWikiService";

describe("convert", () => {
	it("should convert a TiddlyWiki tiddler to Markdown", () => {
		const basePath = path.join(__dirname, "samples");
		const tiddlerText = fs.readFileSync(path.join(basePath, "test.tid"), "utf-8");
		const expectedMarkdown = fs.readFileSync(path.join(basePath, "test.md"), "utf-8");

		const convertedMarkdown = convertTiddlyWikiToMarkdown(tiddlerText)

		expect(convertedMarkdown).toEqual(expectedMarkdown);
	});

	it("should convert a markdown to a TiddlyWiki tiddler", () => {
		const basePath = path.join(__dirname, "samples");
		const expectedTiddlerText = fs.readFileSync(path.join(basePath, "from_markdown.tid"), "utf-8");
		const markdown = fs.readFileSync(path.join(basePath, "test.md"), "utf-8");

		const convertedTiddler = convertMarkdownToTiddlyWiki(markdown)

		console.log({ expectedTiddlerText, convertedTiddler, markdown })

		expect(convertedTiddler).toEqual(expectedTiddlerText);
	});
});
