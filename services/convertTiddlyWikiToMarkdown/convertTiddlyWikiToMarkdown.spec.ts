import * as path from "path";
import * as fs from "fs";
import { convertTiddlyWikiToMarkdown } from "./experiments/convert.v22.19";

describe("tiddlyToObsidian", () => {
	it("should convert a TiddlyWiki tiddler to Markdown", () => {
		const basePath = path.join(__dirname, "..", "..", "tests/samples");
		const tiddlerText = fs.readFileSync(path.join(basePath, "test.tid"), "utf-8");
		const expectedMarkdown = fs.readFileSync(path.join(basePath, "test.md"), "utf-8");

		const convertedMarkdown = convertTiddlyWikiToMarkdown(tiddlerText)

		console.log(convertedMarkdown)

		expect(convertedMarkdown).toEqual(expectedMarkdown);
	});
});
