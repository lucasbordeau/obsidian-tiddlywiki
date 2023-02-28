export function convertTiddlyWikiToMarkdown(text: string): string {
	const lines = text.split("\n");
	let output = "";
	let addedLines = 0;

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];

		// Replace Unordered Lists
		line = line.replace(/^(\s*)(\*+)(\s+)/g, (match, p1, p2, p3) => {
			const level = p1.replace(/\t/g, "    ").length / 4 + 1;
			return "  ".repeat(level - 1) + "-".repeat(p2.length) + p3;
		});

		// Replace Ordered Lists
		line = line.replace(/^(\s*)(#+)(\s+)/g, (match, p1, p2, p3) => {
			return p2.replace(/#/g, "1.") + p3;
		});

		// Replace Links
		line = line.replace(/\[\[(.+?)\]\]/g, "[[$1]]");

		// Replace Bold
		line = line.replace(/''(.+?)''/g, "**$1**");

		// Replace Italic
		line = line.replace(/\/\/(.+?)\/\//g, "_$1_");

		// Replace Underline
		line = line.replace(/__(.+?)__/g, "<u>$1</u>");

		// Replace Quote Block
		if (line.startsWith("<<<")) {
			const quoteLines = [];
			for (let j = i + 1; j < lines.length && !lines[j].startsWith("<<<"); j++) {
				const quoteLine = lines[j];
				quoteLines.push(quoteLine.trim() === "" ? "" : `> ${quoteLine}`);
			}
			const quote = quoteLines.join("\n");
			output += `${quote}\n`;
			addedLines += quoteLines.length + 1;
		}

		// Increment i by the number of lines added to the output
		i += addedLines - 1;
		addedLines = 0;
	}

	// Replace Headings
	output = output.replace(/^(!{1,6})(\s+)(.+)/gm, (match, p1, p2, p3) => {
		const level = p1.length;
		return "#".repeat(level) + p2 + p3;
	});

	// Replace Images
	output = output.replace(/\[img\[(.+?)\]\]/g, "![[$1]]");

	return output;
}
