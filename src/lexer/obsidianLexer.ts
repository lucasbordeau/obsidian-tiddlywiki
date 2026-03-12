import { BlockToken, HeadingLevel } from './types';

// Matches Obsidian headings: 1–6 `#` followed by a space and non-empty text.
// `#tag` (no trailing space) is intentionally not matched — it is a hashtag.
const OBSIDIAN_HEADING_RE = /^(#{1,6}) (.+)/;

export function lexObsidian(content: string): BlockToken[] {
  const tokens: BlockToken[] = [];

  for (const line of content.split('\n')) {
    const headingMatch = OBSIDIAN_HEADING_RE.exec(line);
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
