export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	const lines = tiddlyWikiText.split("\n");
	let markdownText = "";

	for (const line of lines) {
		// Headings
		const headingMatch = /^(!+).*(\n|$)/.exec(line);
		if (headingMatch) {
			const level = headingMatch[1].length;
			markdownText += "#".repeat(level) + " " + line.substring(level + 1) + "\n";
			continue;
		}

		// Unordered List
		const unorderedListMatch = /^(\*+).*(\n|$)/.exec(line);
		if (unorderedListMatch) {
			const level = unorderedListMatch[1].length;
			markdownText += "  ".repeat(level - 1) + "- " + line.substring(level + 1) + "\n";
			continue;
		}

		// Ordered List
		const orderedListMatch = /^(\#+).*(\n|$)/.exec(line);
		if (orderedListMatch) {
			const level = orderedListMatch[1].length;
			markdownText += "  ".repeat(level - 1) + "1. " + line.substring(level + 1) + "\n";
			continue;
		}

		// Definition List
		const definitionListMatch = /^(;.*)\n(:.*)/.exec(line);
		if (definitionListMatch) {
			markdownText += definitionListMatch[1] + " " + definitionListMatch[2] + "\n";
			continue;
		}

		// Quote Block
		const quoteMatch = /^(>+).*(\n|$)/.exec(line);
		if (quoteMatch) {
			const level = quoteMatch[1].length;
			markdownText += ">".repeat(level) + " " + line.substring(level + 1) + "\n";
			continue;
		}

		// Code block
		const codeBlockMatch = /^{{{.*$/.test(line);
		if (codeBlockMatch) {
			markdownText += "```\n";
			continue;
		}

		const endCodeBlockMatch = /^}}}$/.test(line);
		if (endCodeBlockMatch) {
			markdownText += "```\n";
			continue;
		}

		// Bold
		const boldMatch = /''(.+?)''/g;
		markdownText += line.replace(boldMatch, "**$1**");

		// Italic
		const italicMatch = /\/\/(.+?)\/\//g;
		markdownText = markdownText.replace(italicMatch, "__$1__");

		// Underline
		const underlineMatch = /__(.+?)__/g;
		markdownText = markdownText.replace(underlineMatch, "<u>$1</u>");

		// Strike­through
		const strikethroughMatch = /--(.+?)--/g;
		markdownText = markdownText.replace(strikethroughMatch, "~~$1~~");

		// Image
		const imageMatch = /\[img\[(.+?)\]\]/g;
		markdownText = markdownText.replace(imageMatch, "![$1]");

		// Internal Link
		const internalLinkMatch = /\[\[(.+?)\]\]/g;
		markdownText = markdownText.replace(internalLinkMatch, "[$1](($1))");

		markdownText += "\n";
	}

	return markdownText;
}
