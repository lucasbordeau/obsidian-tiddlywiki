export function convertTiddlyWikiToMarkdown(tiddlyWiki: string): string {
	let markdown = "";
	const lines = tiddlyWiki.split("\n");
	let inQuoteBlock = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// Handle image syntax
		const imageRegex = /\[img\[(.*?)\]\]/g;
		const imageMatch = imageRegex.exec(line);
		if (imageMatch) {
			markdown += `![[${imageMatch[1]}]]\n`;
			continue;
		}

		// Handle bold syntax
		const boldRegex = /''(.*?)''/g;
		const boldMatch = boldRegex.exec(line);
		if (boldMatch) {
			const boldText = boldMatch[1].replace(/\*/g, "\\*");
			markdown += `**${boldText}**`;
			continue;
		}

		// Handle italic syntax
		const italicRegex = /\/\/(.*?)\/\//g;
		const italicMatch = italicRegex.exec(line);
		if (italicMatch) {
			markdown += `__${italicMatch[1]}__`;
			continue;
		}

		// Handle underline syntax
		const underlineRegex = /__(.*?)__/g;
		const underlineMatch = underlineRegex.exec(line);
		if (underlineMatch) {
			markdown += `<u>${underlineMatch[1]}</u>`;
			continue;
		}

		// Handle strikethrough syntax
		const strikethroughRegex = /~~(.*?)~~/g;
		const strikethroughMatch = strikethroughRegex.exec(line);
		if (strikethroughMatch) {
			markdown += `~~${strikethroughMatch[1]}~~`;
			continue;
		}

		// Handle headings syntax
		const headingRegex = /(!{1,6})(.*)/g;
		const headingMatch = headingRegex.exec(line);
		if (headingMatch) {
			const level = headingMatch[1].length;
			const text = headingMatch[2].trim();
			markdown += `${"#".repeat(level)} ${text}\n`;
			continue;
		}

		// Handle unordered lists syntax
		const unorderedListRegex = /^\*(.*)/g;
		const unorderedListMatch = unorderedListRegex.exec(line);
		if (unorderedListMatch) {
			markdown += `- ${unorderedListMatch[1].trim()}\n`;
			continue;
		}

		// Handle ordered lists syntax
		const orderedListRegex = /^#(.*)/g;
		const orderedListMatch = orderedListRegex.exec(line);
		if (orderedListMatch) {
			markdown += `1. ${orderedListMatch[1].trim()}\n`;
			continue;
		}

		// Handle quote block syntax
		const quoteBlockRegex = /^>>(.*)/g;
		const quoteBlockMatch = quoteBlockRegex.exec(line);
		if (quoteBlockMatch) {
			if (!inQuoteBlock) {
				markdown += "\n";
				inQuoteBlock = true;
			}
			markdown += `> ${quoteBlockMatch[1].trim()}\n`;
			continue;
		} else {
			inQuoteBlock = false;
		}

		// Handle code block syntax
		const codeBlockRegex = /^```(.*?)$/g;
		const codeBlockMatch = codeBlockRegex.exec(line);
		if (codeBlockMatch) {
			const language = codeBlockMatch[1].trim();


			markdown += "```" + language + "\n";
			let j = i + 1;
			for (; j < lines.length; j++) {
				const codeLine = lines[j];
				if (codeLine.startsWith("```")) {
					break;
				}
				markdown += codeLine + "\n";
			}
			i = j;
			markdown += "```\n";
			continue;
		}

		// If none of the above conditions were met, then just add the line as is
		markdown += line + "\n";

	}

	return markdown.trim();
}

