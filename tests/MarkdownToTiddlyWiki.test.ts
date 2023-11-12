import { convertMarkdownToTiddlyWiki } from "../services/MarkdownToTiddlyWikiService";
import { TiddlyToMarkdownTestData, markdownTestData } from "./TiddlyWikiToMarkdown.test";

describe("convert ", () => {
    it.each<TiddlyToMarkdownTestData>(markdownTestData)("should convert a Markdown tiddler to TiddlyWiki", ({tiddlerText, expectedMarkdown}) => {
            const convertedMarkdown = convertMarkdownToTiddlyWiki(expectedMarkdown);
            expect(convertedMarkdown).toEqual(tiddlerText);
        });
});