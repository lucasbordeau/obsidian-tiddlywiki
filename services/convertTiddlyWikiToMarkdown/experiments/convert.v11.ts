export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	// Replace images
	tiddlyWikiText = tiddlyWikiText.replace(/\[img\[(.*?)\]\]/g, "![[$1]]");

	// Replace bold, italic, underline and strikethrough
	tiddlyWikiText = tiddlyWikiText.replace(/''(.*?)''/g, "**$1**");
	tiddlyWikiText = tiddlyWikiText.replace(/\/\/(.*?)\/\//g, "_$1_");
	tiddlyWikiText = tiddlyWikiText.replace(/__(.*?)__/g, "<u>$1</u>");
	tiddlyWikiText = tiddlyWikiText.replace(/~~(.*?)~~/g, "~~$1~~");

	// Replace headings
	tiddlyWikiText = tiddlyWikiText.replace(/^!+(.*)$/gm, (match, p1) => {
		const level = match.length;
		return "#".repeat(level) + " " + p1.trim();
	});

	// Replace lists
	tiddlyWikiText = tiddlyWikiText.replace(/^(\*+|\#+)(.*)$/gm, (match, p1, p2) => {
		const level = p1.includes("*") ? "*" : p1.length + ".";
		return level + " " + p2.trim();
	});

	// Replace quote block
	tiddlyWikiText = tiddlyWikiText.replace(/>>>(.*)<<<\n?/gms, (match, p1) => {
		return "> " + p1.trim().replace(/\n/g, "\n> ") + "\n";
	});

	// Replace code block
	tiddlyWikiText = tiddlyWikiText.replace(/```([\s\S]*?)```/gms, "```\n$1\n```");

	return tiddlyWikiText.trim();
}
