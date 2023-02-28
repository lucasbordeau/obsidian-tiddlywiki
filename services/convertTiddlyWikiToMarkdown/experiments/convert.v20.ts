export function convertTiddlyWikiToMarkdown(text: string): string {
	const lines = text.split('\n');

	let output = '';

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const nextLine = lines[i + 1];

		// Unordered Lists
		if (line.startsWith('*')) {
			output += '- ' + line.substring(1) + '\n';
		}
		// Ordered Lists
		else if (line.startsWith('#')) {
			output += '1.' + line.substring(1) + '\n';
		}
		// Headings
		else if (line.startsWith('!')) {
			const headingLevel = line.match(/^!/g)?.length ?? 0;
			output += '#'.repeat(headingLevel) + ' ' + line.substring(headingLevel) + '\n';
		}
		// Images
		else if (line.startsWith('[img[') && line.endsWith(']]')) {
			const imageFilename = line.substring(5, line.length - 2);
			output += `![[${imageFilename}]]\n`;
		}
		// Bold
		else if (line.includes("''")) {
			const boldRegex = /''(.*?)''/g;
			output += line.replace(boldRegex, '**$1**') + '\n';
		}
		// Italic
		else if (line.includes('//')) {
			const italicRegex = /\/\/(.*?)\/\//g;
			output += line.replace(italicRegex, '_$1_') + '\n';
		}
		// Underline
		else if (line.includes('__')) {
			const underlineRegex = /__(.*?)__/g;
			output += line.replace(underlineRegex, '<u>$1</u>') + '\n';
		}
		// Strike­through
		else if (line.includes('~~')) {
			const strikethroughRegex = /~~(.*?)~~/g;
			output += line.replace(strikethroughRegex, '~~$1~~') + '\n';
		}
		// Quote Block
		else if (line.startsWith('>')) {
			if (nextLine && !nextLine.startsWith('>')) {
				output += line + '\n\n';
			} else {
				output += line + '\n';
			}
		}
		// Code block
		else if (line.startsWith('```')) {
			output += line + '\n';
			i++;
			while (i < lines.length && !lines[i].startsWith('```')) {
				output += lines[i] + '\n';
				i++;
			}
			output += '```\n';
		}
		// Normal line
		else {
			output += line + '\n';
		}
	}

	return output;
}
