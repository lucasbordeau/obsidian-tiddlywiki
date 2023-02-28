export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	const lines = tiddlyWikiText.split("\n");
	const outputLines = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let outputLine = line;

		if (/^\[img\[(.*?)\]\]/.test(line)) {
			// Replace images
			outputLine = line.replace(/^\[img\[(.*?)\]\]/, "![[$1]]");
		} else if (/^!(.*?)$/.test(line)) {
			// Replace headings
			const levelMatch = line.match(/^(!+)/);
			const level = levelMatch ? levelMatch[1].length : 1;
			outputLine = "#".repeat(level) + " " + line.substring(level).trim();
		} else if (/^(\*+|\#+)(.*)$/.test(line)) {
			// Replace lists
			const levelMatch = line.match(/^(\*+|\#+)/);
			const level = levelMatch ? levelMatch[1].includes("*") ? "*" : levelMatch[1].length + "." : "";
			outputLine = level + " " + line.substring(level.length).trim();
		} else if (/^>>>(.*)$/.test(line)) {
			// Replace quote block
			let quoteBlock = [line.match(/^>>>(.*)$/)?.[1]];
			while (i < lines.length - 1 && !/^<<<(.*)$/.test(lines[i + 1])) {
				i++;
				quoteBlock.push(lines[i]);
			}
			outputLine = "> " + quoteBlock.join("\n> ") + "\n";
		} else if (/^```.*$/.test(line)) {
			// Replace code block
			let codeBlock = [line];
			while (i < lines.length - 1 && !/^```$/.test(lines[i + 1])) {
				i++;
				codeBlock.push(lines[i]);
			}
			outputLine = codeBlock.join("\n");
		} else {
			// Replace bold, italic, underline and strikethrough
			outputLine = line.replace(/''(.*?)''/g, "**$1**")
				.replace(/\/\/(.*?)\/\//g, "_$1_")
				.replace(/__(.*?)__/g, "<u>$1</u>")
				.replace(/~~(.*?)~~/g, "~~$1~~");
		}

		outputLines.push(outputLine);
	}

	return outputLines.join("\n").trim();
}
