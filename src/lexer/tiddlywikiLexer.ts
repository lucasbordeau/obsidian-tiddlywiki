import { BlockToken, HeadingLevel } from './types';

// Matches TiddlyWiki headings: 1–6 `!` at line start followed by a space and text.
// `![[transclusion]]` or `!word` do not match because they lack the trailing space.
const TIDDLYWIKI_HEADING_RE = /^(!{1,6}) (.+)/;

export function lexTiddlywiki(content: string): BlockToken[] {
  const tokens: BlockToken[] = [];

  for (const line of content.split('\n')) {
    const headingMatch = TIDDLYWIKI_HEADING_RE.exec(line);
    if (headingMatch) {
      tokens.push({
        type: 'heading',
        level: headingMatch[1].length as HeadingLevel,
        rawText: headingMatch[2],
      });
      continue;
    }

    if (/^\s*$/.test(line)) {
      tokens.push({ type: 'blank' });
      continue;
    }

    tokens.push({ type: 'paragraph', rawText: line });
  }

  return tokens;
}
