export function convertTiddlyWikiToMarkdown(tiddler: string): string {
	// Replace [img[filename]] with ![[filename]]
	tiddler = tiddler.replace(/\[img\[(.*?)\]\]/g, "![[$1]]");

	// Replace headings
	tiddler = tiddler.replace(/^(!+)(.*)$/gm, (_, level, text) => `${"#".repeat(level.length)} ${text}`);

	// Replace bold and italic
	tiddler = tiddler.replace(/''(.*?)''/g, "**$1**").replace(/\/\/(.*?)\/\//g, "_$1_");

	// Replace underline with <u>
	tiddler = tiddler.replace(/__(.*?)__/g, "<u>$1</u>");

	// Replace strikethrough
	tiddler = tiddler.replace(/~~(.*?)~~/g, "~~$1~~");

	// Replace unordered lists
	tiddler = tiddler.replace(/^(\*+)(.*)$/gm, (_, stars, text) => `${" ".repeat((stars.length - 1) * 2)}- ${text}`);

	// Replace ordered lists
	tiddler = tiddler.replace(/^(\#+)(.*)$/gm, (_, nums, text) => `${" ".repeat((nums.length - 1) * 2)}${nums.length}. ${text}`);

	// Replace blockquotes
	tiddler = tiddler.replace(/^> (.*)$/gm, "> $1");

	// Replace code blocks
	tiddler = tiddler.replace(/```([\w\s]*)\n(.*?)```/gs, "```$1\n$2```");

	return tiddler;
}
