import { convertTiddlyWikiToMarkdown } from "../services/TiddlyWikiToMarkdownService";

export type TiddlyToMarkdownTestData = { tiddlerText: string, expectedMarkdown: string };

export const markdownTestData: TiddlyToMarkdownTestData[] = [
    {
        tiddlerText: "The ''quick'' brown ~~flea~~ fox //jumps// over the `lazy` dog",
        expectedMarkdown: "The **quick** brown ~~flea~~ fox _jumps_ over the `lazy` dog"
    },
    {
        tiddlerText: "This is a link to HelloThere, and one to [[History of TiddlyWiki]]",
        expectedMarkdown: "This is a link to [[HelloThere]], and one to [[History of TiddlyWiki]]"
    },
    {   // URLs are not converted to links
        tiddlerText: `https://tiddlywiki.com/ and [[TW5|https://tiddlywiki.com/]] are links`,
        expectedMarkdown: `https://tiddlywiki.com/ and [TW5](https://tiddlywiki.com/) are links`
    },
    {
        tiddlerText: "* ~HelloThere is not a link",
        expectedMarkdown: "- HelloThere is not a link"
    },
    {
        tiddlerText: "Title different from page: [[Displayed Link Title|Tiddler Title]]",
        expectedMarkdown: "Title different from page: [Displayed Link Title](Tiddler Title)"
    },
    {
        tiddlerText: "Two images: [img[Logo.png]] and external [img[https://tiddlywiki.com/favicon.ico]]",
        expectedMarkdown: "Two images: ![[Logo.png]] and external ![https://tiddlywiki.com/favicon.ico](https://tiddlywiki.com/favicon.ico)"
    },
    {
        tiddlerText: "```\nThis is a code block\n* Don't convert this to a list\n# A Comment\n! Not a header\n```",
        expectedMarkdown: "```\nThis is a code block\n* Don't convert this to a list\n# A Comment\n! Not a header\n```",
    },
    {
        tiddlerText: `! This is a level 1 heading\n!! This is a level 2 heading`,
        expectedMarkdown: `# This is a level 1 heading\n## This is a level 2 heading`
    },
    {
        tiddlerText: `* First list item\n* Second list item\n** A subitem\n* Third list item`,
        expectedMarkdown: `- First list item\n- Second list item\n  - A subitem\n- Third list item`
    },
    {
        tiddlerText: `A numbered list:\n# First list item\n# Second list item\n## A subitem\n# Third list item`,
        expectedMarkdown: `A numbered list:\n1. First list item\n1. Second list item\n   1. A subitem\n1. Third list item`
    },
];

describe("convert ", () => {
    it.each<TiddlyToMarkdownTestData>(markdownTestData)("should convert a TiddlyWiki tiddler to Markdown", ({tiddlerText, expectedMarkdown}) => {
            const convertedMarkdown = convertTiddlyWikiToMarkdown(tiddlerText);
            expect(convertedMarkdown).toEqual(expectedMarkdown);
        });
})