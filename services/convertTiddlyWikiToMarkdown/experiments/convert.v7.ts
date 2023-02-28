export function convertTiddlyWikiToMarkdown(tiddlyWikiText: string): string {
	const lines = tiddlyWikiText.split('\n');
	let result = '';

	let codeBlock = false;

	for (const line of lines) {
		if (line.startsWith('[img[')) {
			const imageName = line.substring(5, line.length - 2);
			result += `![[${imageName}]]\n`;
		} else if (line.startsWith('! ')) {
			result += `# ${line.substring(2)}\n`;
		} else if (line.startsWith('!! ')) {
			result += `## ${line.substring(3)}\n`;
		} else if (line.startsWith('!!! ')) {
			result += `### ${line.substring(4)}\n`;
		} else if (line.startsWith('* [[')) {
			result += `- ${line.substring(3, line.length - 2)}\n`;
		} else if (line.startsWith(';; ')) {
			result += `_${line.substring(3)}_\n`;
		} else if (line.startsWith('* ')) {
			result += `- ${line.substring(2)}\n`;
		} else if (line.startsWith('# ')) {
			result += `1. ${line.substring(2)}\n`;
		} else if (line.startsWith('## ')) {
			result += `1.1. ${line.substring(3)}\n`;
		} else if (line.startsWith('### ')) {
			result += `1.1.1. ${line.substring(4)}\n`;
		} else if (line.startsWith('; ')) {
			result += `> ${line.substring(2)}\n`;
		} else if (line.startsWith('{{{')) {
			codeBlock = true;
			result += '```typescript\n';
		} else if (line.startsWith('}}}') || line.startsWith('}}} ')) {
			codeBlock = false;
			result += '\n```';
		} else if (codeBlock) {
			result += `${line}\n`;
		} else {
			result += `${line}\n`;
		}
	}

	return result;
}
