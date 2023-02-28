import * as path from "path";
import * as fs from "fs";
import { convertTiddlyWikiToMarkdown } from "../services/TiddlyWikiToMarkdownService";

describe("convert", () => {
	it("should convert a TiddlyWiki tiddler to Markdown", () => {
		const basePath = path.join(__dirname, "samples");
		const tiddlerText = fs.readFileSync(path.join(basePath, "test.tid"), "utf-8");
		const expectedMarkdown = fs.readFileSync(path.join(basePath, "test.md"), "utf-8");

		const convertedMarkdown = convertTiddlyWikiToMarkdown(tiddlerText)


		expect(convertedMarkdown).toEqual(expectedMarkdown);
	});
});
