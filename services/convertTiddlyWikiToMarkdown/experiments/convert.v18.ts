export function convertTiddlyWikiToMarkdown(tiddlyWiki: string): string {
	const lines = tiddlyWiki.split('\n');

	let markdown = '';

	for (const line of lines) {
		let processedLine = line;

		// Image: [img[test.jpg]] to ![[test.jpg]]
		const imageRegex = /\[img\[(?<image>.*?)\]\]/g;
		processedLine = processedLine.replace(imageRegex, '![[${image}]]');

		// Bold: '' to **
		const boldRegex = /''(?<bold>.*?)''/g;
		processedLine = processedLine.replace(boldRegex, '**${bold}**');

		// Italic: // to _
		const italicRegex = /\/\/(?<italic>.*?)\/\//g;
		processedLine = processedLine.replace(italicRegex, '_${italic}_');

		// Underline: __ to <u>
		const underlineRegex = /__(?<underline>.*?)__/g;
		processedLine = processedLine.replace(underlineRegex, '<u>${underline}</u>');

		// Strike­through: ~~ to ~~
		const strikethroughRegex = /~~(?<strikethrough>.*?)~~/g;
		processedLine = processedLine.replace(strikethroughRegex, '~~${strikethrough}~~');

		// Headings: ! to # (multi level)
		const headingRegex = /^(?<heading>!+)(?<content>.*)$/;
		const headingMatch = processedLine.match(headingRegex);
		if (headingMatch) {
			const level = headingMatch.groups!.heading.length;
			processedLine = '#'.repeat(level) + ' ' + headingMatch.groups!.content;
		}

		// Unordered Lists: * to -
		const unorderedListRegex = /^(?<unorderedList>\*+)(?<content>.*)$/;
		const unorderedListMatch = processedLine.match(unorderedListRegex);
		if (unorderedListMatch) {
			const level = unorderedListMatch.groups!.unorderedList.length;
			processedLine = '  '.repeat(level - 1) + '- ' + unorderedListMatch.groups!.content;
		}

		// Ordered Lists: # to 1.
		const orderedListRegex = /^(?<orderedList>#+)(?<content>.*)$/;
		const orderedListMatch = processedLine.match(orderedListRegex);
		if (orderedListMatch) {
			const level = orderedListMatch.groups!.orderedList.length;
			processedLine = '  '.repeat(level - 1) + '1. ' + orderedListMatch.groups!.content;
		}

		// Quote Block
		const quoteRegex = /^(?<quote>>.*)$/;
		const quoteMatch = processedLine.match(quoteRegex);
		if (quoteMatch) {
			processedLine = '> ' + quoteMatch.groups!.quote.slice(1);
		}

		// Code block
		const codeBlockRegex = /^```(?<language>.*)\n(?<code>.*?)```$/gms;
		processedLine = processedLine.replace(codeBlockRegex, '```\n${code}\n```');

		markdown += processedLine + '\n';
	}

	return markdown.trim();
}
