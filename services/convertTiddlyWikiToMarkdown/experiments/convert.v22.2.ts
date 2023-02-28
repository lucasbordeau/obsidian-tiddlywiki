export function convertTiddlyWikiToMarkdown(text: string): string {
	// Replace Unordered Lists
	text = text.replace(/^(\s*)(\*+)(\s+)/gm, (match, p1, p2, p3) => {
		const level = p1.replace(/\t/g, "    ").length / 4 + 1;
		return "  ".repeat(level - 1) + "-".repeat(p2.length) + p3;
	});

	// Replace Ordered Lists
	text = text.replace(/^(\s*)(#+)(\s+)/gm, (match, p1, p2, p3) => {
		const level = p1.replace(/\t/g, "    ").length / 4 + 1;
		return "  ".repeat(level - 1) + p2.replace(/#/g, `${level}.`) + p3;
	});

	// Replace Links
	text = text.replace(/\[\[(.+?)\]\]/g, "[[$1]]");

	// Replace Bold
	text = text.replace(/''(.+?)''/g, "**$1**");

	// Replace Italic
	text = text.replace(/\/\/(.+?)\/\//g, "_$1_");

	// Replace Underline
	text = text.replace(/__(.+?)__/g, "<u>$1</u>");

	// Replace Quote Block
	text = text.replace(/^<<<(.+)$/gm, (match, p1) => {
		const lines = p1.split("\n").map((line: string) => `> ${line}`);
		return lines.join("\n");
	});

	// Replace Headings
	text = text.replace(/^(!{1,6})(\s+)(.+)/gm, (match, p1, p2, p3) => {
		const level = p1.length;
		return "#".repeat(level) + p2 + p3;
	});

	// Replace Images
	text = text.replace(/\[img\[(.+?)\]\]/g, "![[$1]]");

	return text;
}
