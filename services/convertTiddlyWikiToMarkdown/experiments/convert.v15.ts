export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	const lines = tiddlyWikiText.split("\n");

	let markdownText = "";
	let codeBlock = false;
	let quoteBlock = false;

	const unorderedListRegex = /^\* (.+)/;
	const orderedListRegex = /^# (.+)/;
	const headingRegex = /^(!{1,6}) (.+)/;
	const imageRegex = /^\[img\[(.+)\]\]/;
	const boldRegex = /''(.+)''/g;
	const italicRegex = /\/\/(.+?)\/\//g;
	const underlineRegex = /__(.+)__/g;
	const strikethroughRegex = /~~(.+?)~~/g;

	for (const line of lines) {
		if (codeBlock) {
			if (line === "```") {
				codeBlock = false;
				markdownText += "```\n\n";
			} else {
				markdownText += line + "\n";
			}
		} else if (quoteBlock) {
			if (line.startsWith("<<<")) {
				quoteBlock = false;
				markdownText += "\n";
			} else {
				markdownText += "> " + line + "\n";
			}
		} else if (unorderedListRegex.test(line)) {
			const match = line.match(unorderedListRegex);
			markdownText += `- ${match![1]}\n`;
		} else if (orderedListRegex.test(line)) {
			const match = line.match(orderedListRegex);
			markdownText += `1. ${match![1]}\n`;
		} else if (headingRegex.test(line)) {
			const match = line.match(headingRegex);
			const level = match![1].length;
			markdownText += `${"#".repeat(level)} ${match![2]}\n`;
		} else if (imageRegex.test(line)) {
			const match = line.match(imageRegex);
			markdownText += `![[${match![1]}]]\n\n`;
		} else if (boldRegex.test(line)) {
			const match = line.match(boldRegex);
			markdownText += line.replace(boldRegex, "**$1**") + "\n";
		} else if (italicRegex.test(line)) {
			const match = line.match(italicRegex);
			markdownText += line.replace(italicRegex, "_$1_") + "\n";
		} else if (underlineRegex.test(line)) {
			const match = line.match(underlineRegex);
			markdownText += line.replace(underlineRegex, "<u>$1</u>") + "\n";
		} else if (strikethroughRegex.test(line)) {
			const match = line.match(strikethroughRegex);
			markdownText += line.replace(strikethroughRegex, "~~$1~~") + "\n";
		} else if (line === "```\n") {
			codeBlock = true;
			markdownText += "```\n";
		} else if (line.startsWith("<<<")) {
			quoteBlock = true;
			markdownText += "\n";
		} else {
			markdownText += line + "\n";
		}
	}

	return markdownText;
}
