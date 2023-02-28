export function convertTiddlyWikiToMarkdown(input: string): string {
	let output = '';

	const lines = input.split('\n');
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];

		// Image
		line = line.replace(/\[img\[(.*?)\]\]/g, "![[$1]]");

		// Bold
		line = line.replace(/''(.*?)''/g, "**$1**");

		// Italic
		line = line.replace(/\/\/(.*?)\/\//g, "_$1_");

		// Underline
		line = line.replace(/__(.*?)__/g, "<u>$1</u>");

		// Strikethrough
		line = line.replace(/~~(.*?)~~/g, "~~$1~~");

		// Headings
		const match = line.match(/^(!+)(.*)/);
		if (match) {
			const level = match[1].length;
			const text = match[2];
			line = "#".repeat(level) + text;
		}

		// Unordered Lists
		if (line.match(/^\*/)) {
			line = "-" + line.slice(1);
		}

		// Ordered Lists
		const matchNumberedList = line.match(/^(\d+)\./);
		if (matchNumberedList) {
			line = "1.".repeat(matchNumberedList[1].length - 1) + " " + line.slice(matchNumberedList[1].length + 1);
		}

		// Quote Block
		if (line.match(/^>>>/)) {
			line = "> " + line.slice(3);
		}

		// Code block
		if (line.match(/^```/)) {
			output += line + "\n";
			i++;
			while (i < lines.length && !lines[i].match(/^```/)) {
				output += lines[i] + "\n";
				i++;
			}
			output += "```\n";
			continue;
		}

		output += line + "\n";
	}

	return output;
}
