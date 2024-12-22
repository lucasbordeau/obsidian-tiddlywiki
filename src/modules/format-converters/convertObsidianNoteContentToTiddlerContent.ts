export function convertObsidianNoteContentToTiddlerContent(
  obsidianNoteContent: string,
): string {
  const tiddlerContent = obsidianNoteContent;

  // Split by code blocks and external links
  const parts = tiddlerContent.split(/(```[\s\S]*?```|\[.*?\]\([^)]+\))/);

  // Process only the parts that are outside of code blocks and links
  for (let i = 0; i < parts.length; i++) {
    // If it's not a code block or a link, apply the replacement
    if (!parts[i].startsWith('```') && !parts[i].match(/\[.*?\]\([^)]+\)/)) {
      // Replace Bold
      parts[i] = parts[i].replace(/\*\*([^*]+)\*\*/g, "''$1''");

      // Replace Italic
      parts[i] = parts[i].replace(
        /(\b|[^\\])_(\S|\S.*?\S)_(\b|[^\\])/g,
        '$1//$2//$3',
      );

      // Replace Underline
      parts[i] = parts[i].replace(/<u>([^<]+)<\/u>/g, '__$1__');

      // Replace Blockquote
      parts[i] = parts[i]
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

      // Replace transclusions
      parts[i] = parts[i].replace(/!\[\[([^\]]+)\]\]/g, '{{$1}}');

      // Replace Headings
      parts[i] = parts[i].replace(/#+(.*)/gm, (match, p1) => {
        const level = match.match(/#+/)?.[0].length ?? 0;
        return '!'.repeat(level) + ' ' + p1;
      });

      // Replace ! with only one line ending and non white space character before with two line endings
      // To prevent behavior with TiddlyWiki only recognizing two line endings as a new heading section
      parts[i] = parts[i].replace(/(?<!\n)\n!(?!\n)/g, '\n\n!');

      // Remove front matter
      parts[i] = parts[i].replace(/^---\n([\s\S]*?)---\n/, '');

      // Replace Unordered Lists
      parts[i] = parts[i]
        .split('\n') // Split the text into lines
        .map((line) => {
          // Match lines that represent Markdown unordered list items
          const match = line.match(/^(\t*)(-|\*)(.*)/);
          if (!match) {
            // Return the line unchanged if it doesn't match
            return line;
          }

          console.log({
            match,
          });

          const [, tabs, , content] = match;
          // Calculate the level based on the number of leading tabs
          const level = (tabs ?? []).length + 1;
          // Generate the TiddlyWiki-style list item
          return '*'.repeat(level) + content;
        })
        .join('\n'); // Rejoin the processed lines back into a single string

      // Replace Ordered Lists
      parts[i] = parts[i]
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
      parts[i] = parts[i].replace(/\[\[([^\]]+)\]\]/g, (match, p1) => {
        const linkRegex = /((?:[^[\]|\\]|\\.)+)(?:\|((?:[^[\]|\\]|\\.)+))?/;
        const linkMatch = linkRegex.exec(p1);

        if (!linkMatch) return match;

        const linkElement1 = linkMatch[1];
        const linkElement2 = linkMatch[2] ? linkMatch[2] : '';

        // Remove leading | character if there is no description
        return `[[${linkElement2 ? `${linkElement2}|` : ''}${linkElement1}]]`;
      });
    } else {
      // Replace markdown external links with TiddlyWiki links
      parts[i] = parts[i].replace(/\[(.*?)\]\((.*?)\)/g, '[[$1|$2]]');
    }
  }

  // Rejoin the parts back together
  return parts.join('');
}
