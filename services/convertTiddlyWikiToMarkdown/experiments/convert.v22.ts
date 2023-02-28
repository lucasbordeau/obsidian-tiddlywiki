export function convertTiddlyWikiToMarkdown(text: string): string {
	// Replace Unordered Lists
	text = text.replace(/^(\s*)\*(\s+)/gm, "$1-$2");

	// Replace Ordered Lists
	text = text.replace(/^(\s*)#(\s+)/gm, "$11.$2");

	// Replace Links
	text = text.replace(/\[\[(.+?)\]\]/g, "[[$1]]");

	// Replace Bold
	text = text.replace(/''(.+?)''/g, "**$1**");

	// Replace Italic
	text = text.replace(/\/\/(.+?)\/\//g, "_$1_");

	// Replace Underline
	text = text.replace(/__(.+?)__/g, "<u>$1</u>");

	// Replace Quote Block
	text = text.replace(/^<<<(.+)/gm, "> $1");

	// Replace Headings
	text = text.replace(/^(!{1,6})(\s+)(.+)/gm, (match, p1, p2, p3) => {
		const level = p1.length;
		return "#".repeat(level) + p2 + p3;
	});

	// Replace Images
	text = text.replace(/\[img\[(.+?)\]\]/g, "![[$1]]");

	return text;
}
