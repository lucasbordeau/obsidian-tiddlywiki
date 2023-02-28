export function convertTiddlyWikiToMarkdown(text: string): string {
	const lines = text.split("\n");
	let markdownLines = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Replace Unordered Lists
		let convertedLine = line.replace(/^(\s*)(\*+)(\s+)/g, (match, p1, p2, p3) => {
			const level = p1.replace(/\t/g, "    ").length / 4 + 1;
			return "  ".repeat(level - 1) + "-".repeat(p2.length) + p3;
		});

		// Replace Ordered Lists
		convertedLine = convertedLine.replace(/^(\s*)(#+)(\s+)/g, (match, p1, p2, p3) => {
			return p2.replace(/#/g, "1.") + p3;
		});

		// Replace Links
		convertedLine = convertedLine.replace(/\[\[(.+?)\]\]/g, "[[$1]]");

		// Replace Bold
		convertedLine = convertedLine.replace(/''(.+?)''/g, "**$1**");

		// Replace Italic
		convertedLine = convertedLine.replace(/\/\/(.+?)\/\//g, "_$1_");

		// Replace Underline
		convertedLine = convertedLine.replace(/__(.+?)__/g, "<u>$1</u>");

		// Replace Quote Block
		if (convertedLine.startsWith("<<<")) {
			let quote = "";
			i++;
			while (i < lines.length && !lines[i].startsWith("<<<")) {
				quote += `> ${lines[i]}\n`;
				i++;
			}
			markdownLines.push(quote.trim());
			i--;
			continue;
		}

		// Replace Headings
		convertedLine = convertedLine.replace(/^(!{1,6})(\s+)(.+)/g, (match, p1, p2, p3) => {
			const level = p1.length;
			return "#".repeat(level) + p2 + p3;
		});

		// Replace Images
		convertedLine = convertedLine.replace(/\[img\[(.+?)\]\]/g, "![[$1]]");

		markdownLines.push(convertedLine);
	}

	return markdownLines.join("\n");
}
