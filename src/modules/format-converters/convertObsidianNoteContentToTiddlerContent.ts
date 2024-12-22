export function convertObsidianNoteContentToTiddlerContent(
  obsidianNoteContent: string,
): string {
  let tiddlerContent = obsidianNoteContent;

  // Replace Headings
  tiddlerContent = tiddlerContent.replace(/^#+\s+(.*)$/gm, (match, p1) => {
    const level = match.match(/^#+/)?.[0].length ?? 0;
    return '!'.repeat(level) + ' ' + p1;
  });

  // Remove front matter
  tiddlerContent = tiddlerContent.replace(/^---\n([\s\S]*?)---\n/, '');

  // Replace Unordered Lists
  tiddlerContent = tiddlerContent
    .split('\n')
    .map((line) => {
      const match = line.match(/^( *)(-+)( +)(.*)$/);
      if (!match) {
        return line;
      }
      const level = match[1].replace(/\t/g, '    ').length / 2 + 1;
      return (
        '\t'.repeat(level - 1) +
        '*'.repeat(match[2].length) +
        match[3] +
        match[4]
      );
    })
    .join('\n');

  // Replace Ordered Lists
  tiddlerContent = tiddlerContent
    .split('\n')
    .map((line) => {
      const match = line.match(/^( *)(\d+)\.( +)(.*)$/);
      if (!match) {
        return line;
      }
      const level = match[1].replace(/\t/g, '    ').length / 4 + 1;
      const prefix = '#'.repeat(level);
      return prefix + match[3] + match[4];
    })
    .join('\n');

  // Replace Links
  tiddlerContent = tiddlerContent.replace(/\[\[([^\]]+)\]\]/g, (match, p1) => {
    const linkRegex = /((?:[^[\]|\\]|\\.)+)(?:\|((?:[^[\]|\\]|\\.)+))?/;
    const linkMatch = linkRegex.exec(p1);

    if (!linkMatch) return match;

    const linkElement1 = linkMatch[1];
    const linkElement2 = linkMatch[2] ? linkMatch[2] : '';

    // Remove leading | character if there is no description
    return `[[${linkElement2 ? `${linkElement2}|` : ''}${linkElement1}]]`;
  });

  // Replace Bold
  tiddlerContent = tiddlerContent.replace(/\*\*([^*]+)\*\*/g, "''$1''");

  // Replace Italic
  tiddlerContent = tiddlerContent.replace(
    /(\b|[^\\])_(\S|\S.*?\S)_(\b|[^\\])/g,
    '$1//$2//$3',
  );

  // Replace Underline
  tiddlerContent = tiddlerContent.replace(/<u>([^<]+)<\/u>/g, '__$1__');

  // Replace trasnclusion
  tiddlerContent = tiddlerContent.replace(/!\[\[([^\]]+)\]\]/g, '{{$1}}');

  // Replace Blockquote
  tiddlerContent = tiddlerContent
    .split('\n')
    .map((line, index, lines) => {
      const match = line.match(/^> (.*)/);
      if (!match) {
        return line;
      }

      // If this is the first line of the blockquote, add <<< before it
      if (index === 0 || lines[index - 1].match(/^\s*$/)) {
        line = `<<<\n${match[1]}`;
      } else {
        line = match[1];
      }

      // If this is the last line of the blockquote, add >>> after it
      if (index === lines.length - 1 || lines[index + 1].match(/^\s*$/)) {
        line += '\n<<<';
      }

      return line;
    })
    .join('\n');

  return tiddlerContent;
}
