export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	const regexes = [
		{
			pattern: /\[img\[(.+?)\]\]/g,
			replacement: "![[$1]]",
		},
		{
			pattern: /''(.+?)''/g,
			replacement: "**$1**",
		},
		{
			pattern: /\/\/(.+?)\/\//g,
			replacement: "__$1__",
		},
		{
			pattern: /__(.+?)__/g,
			replacement: "<u>$1</u>",
		},
		{
			pattern: /~~(.+?)~~/g,
			replacement: "~~$1~~",
		},
		{
			pattern: /!(.*)/g,
			replacement: (match: string, p1: string) => {
				const level = p1.match(/^(\!+)/)?.[1].length ?? 1;
				const headingText = p1.replace(/^\!+/, "").trim();
				return "#".repeat(level) + " " + headingText;
			},
		},
		{
			pattern: /^\*(.*)/gm,
			replacement: "-$1",
		},
		{
			pattern: /^\#(.*)/gm,
			replacement: "1.$1",
		},
		{
			pattern: /^>>(.*)/gm,
			replacement: "> $1",
		},
		{
			pattern: /^```(\w+)?([\s\S]*?)```/gm,
			replacement: "```$1$2```",
		},
	];

	let markdownText = tiddlyWikiText;
	for (const { pattern, replacement } of regexes) {
		markdownText = markdownText.replace(pattern, replacement as any);
	}
	return markdownText;
}
