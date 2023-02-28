export function convertTiddlyWikiToMarkdown(text: string): string {
	// Replace unordered lists
	text = text.replace(/^(\s*)\*/gm, "$1-");

	// Replace ordered lists
	let counter = 1;
	text = text.replace(/^(\s*)#/gm, () => `${'$1'}${counter++}.`);

	// Replace headings
	text = text.replace(/^!(?=([^<]*<[^>]*|[^<>]*$))/gm, "#");

	// Replace bold
	text = text.replace(/''(.*?)''/g, "**$1**");

	// Replace italic
	text = text.replace(/\/\/(.*?)\/\//g, "_$1_");

	// Replace underline
	text = text.replace(/__(.*?)__/g, "<u>$1</u>");

	// Replace image
	text = text.replace(/\[img\[(.*?)\]\]/g, "![$1]");

	// Replace quote blocks
	text = text.replace(/<<<\n([\s\S]*?)\n<<<+/g, "> $1\n");

	return text;
}
