export function convertTiddlyWikiToMarkdown(text: string): string {
	return text
		.replace(/\[img\[(.+?)\]\]/g, "![[$1]]")
		.replace(/''(.+?)''/g, "**$1**")
		.replace(/\/\/(.+?)\/\//g, "_$1_")
		.replace(/__(.+?)__/g, "<u>$1</u>")
		.replace(/~~(.+?)~~/g, "~~$1~~")
		.replace(/^!(?!\\)(.*)$/gm, (match, p1) => {
			const level = match.search(/\S|$/);
			return "#".repeat(level) + " " + p1;
		})
		.replace(/^(\*+)(?!\\)(.*)$/gm, (match, p1, p2) => {
			const level = p1.length;
			return "  ".repeat(level - 1) + "- " + p2;
		})
		.replace(/^(\#+)(?!\\)(.*)$/gm, (match, p1, p2) => {
			const level = p1.length;
			return "  ".repeat(level - 1) + level + ". " + p2;
		})
		.replace(/^<<<\n([\s\S]*?)\n<<</gm, (match, p1) => {
			return "> " + p1.trim().replace(/\n/g, "\n> ") + "\n";
		})
		.replace(/```([\s\S]*?)```/g, "```\n$1\n```");
}
