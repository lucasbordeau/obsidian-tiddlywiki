export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	// Convert image syntax
	tiddlyWikiText = tiddlyWikiText.replace(/\[img\[(.+?)\]\]/gm, "![[$1]]");

	// Convert links syntax
	tiddlyWikiText = tiddlyWikiText.replace(/\[\[(.+?)\]\]/gm, "[[$1]]");

	// Convert bold syntax
	tiddlyWikiText = tiddlyWikiText.replace(/''(.+?)''/gm, "**$1**");

	// Convert italic syntax
	tiddlyWikiText = tiddlyWikiText.replace(/\/\/(.+?)\/\//gm, "_$1_");

	// Convert underline syntax
	tiddlyWikiText = tiddlyWikiText.replace(/__(.+?)__/gm, "<u>$1</u>");

	// Convert strikethrough syntax
	tiddlyWikiText = tiddlyWikiText.replace(/~~(.+?)~~/gm, "~~$1~~");

	// Convert quote block syntax
	tiddlyWikiText = tiddlyWikiText.replace(/^>>>/gm, ">");

	// Convert unordered list syntax
	tiddlyWikiText = tiddlyWikiText.replace(/^(\*+)/gm, (match, p1) => "-".repeat(p1.length));

	// Convert ordered list syntax
	tiddlyWikiText = tiddlyWikiText.replace(/^(\#+)/gm, (match, p1) => `${p1.length}.`);

	// Convert heading syntax
	tiddlyWikiText = tiddlyWikiText.replace(/^(!+)/gm, (match, p1) => "#".repeat(p1.length));

	return tiddlyWikiText;
}
