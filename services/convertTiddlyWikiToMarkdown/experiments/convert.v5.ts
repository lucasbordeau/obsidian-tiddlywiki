export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	let markdownText = "";
	const lines = tiddlyWikiText.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Check for headings
		const headingMatch = /^(!{1,3})\s(.+)/.exec(line);
		if (headingMatch) {
			const headingLevel = headingMatch[1].length;
			const headingText = headingMatch[2];
			markdownText += `${"#".repeat(headingLevel)} ${headingText}\n`;
			continue;
		}

		// Check for image links
		const imageMatch = /\[img\[(.+)\]\]/.exec(line);
		if (imageMatch) {
			const imagePath = imageMatch[1];
			markdownText += `![[${imagePath}]]\n`;
			continue;
		}

		// Check for bold and italic text
		const boldMatch = /''(.+)''/g.exec(line);
		const italicMatch = /\/\/(.+?)\/\//g.exec(line);
		let modifiedLine = line;
		if (boldMatch) {
			modifiedLine = modifiedLine.replace(/''(.+)''/g, "**$1**");
		}
		if (italicMatch) {
			modifiedLine = modifiedLine.replace(/\/\/(.+?)\/\//g, "_$1_");
		}

		// Add the modified line to the markdown output
		markdownText += `${modifiedLine}\n`;
	}

	return markdownText;
}
