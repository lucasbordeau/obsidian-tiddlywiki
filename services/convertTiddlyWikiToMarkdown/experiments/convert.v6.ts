export function convertTiddlyWikiToMarkdown(twText: string): string {
	const lines = twText.split('\n');
	let mdText = '';

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];

		// Handle headings
		line = line.replace(/^!(=*)\s*(.*)$/, (match, p1, p2) => {
			const level = p1.length + 1;
			return '#'.repeat(level) + ' ' + p2;
		});

		// Handle unordered lists
		line = line.replace(/^\*+\s+(.*)$/, (match, p1) => {
			const level = match.match(/^\*+/)![0].length;
			return '\t'.repeat(level - 1) + '- ' + p1;
		});

		// Handle ordered lists
		line = line.replace(/^#+\s+(.*)$/, (match, p1) => {
			const level = match.match(/^#+/)![0].length;
			return '\t'.repeat(level - 1) + level + '. ' + p1;
		});

		// Handle definitions
		line = line.replace(/^;(.*)\s*:(.*)$/, (match, p1, p2) => {
			return '**' + p1 + '**\n\t' + p2;
		});

		// Handle blockquotes
		line = line.replace(/^>+/, (match) => {
			const level = match.length;
			return '\t'.repeat(level) + '> ';
		});

		// Handle strikethrough
		line = line.replace(/--(.*?)--/g, (match, p1) => {
			return '~~' + p1 + '~~';
		});

		// Handle inline code
		line = line.replace(/`([^`]+)`/g, (match, p1) => {
			return '`' + p1 + '`';
		});

		// Handle bold and italic
		line = line.replace(/''(.*?)''/g, (match, p1) => {
			if (p1.includes('//')) {
				// Handle bold and italic
				return '**_' + p1.replace(/\/\/(.*?)\/\//g, '$1') + '_**';
			} else {
				// Handle bold
				return '**' + p1 + '**';
			}
		});

		// Handle italic
		line = line.replace(/\/\/(.*?)\/\//g, (match, p1) => {
			return '_' + p1 + '_';
		});

		// Handle images
		line = line.replace(/\[img\[(.*?)\]\]/g, (match, p1) => {
			return '![[' + p1 + ']]';
		});

		mdText += line + '\n';
	}

	return mdText;
}
