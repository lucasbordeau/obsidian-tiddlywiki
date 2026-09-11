import MarkdownIt from 'markdown-it';
import { pushInlineToken } from './pushInlineToken';

export function parseHtmlRegion(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);
  const openingTag = /^<([a-z][a-z0-9-]*)\b[^>]*>/i.exec(remaining);

  if (!openingTag) {
    return false;
  }

  const voidElement =
    /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(
      openingTag[1],
    );

  const selfClosing = openingTag[0].endsWith('/>');

  if (voidElement || selfClosing) {
    return false;
  }

  const tagName = openingTag[1];
  const matchingTags = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi');

  matchingTags.lastIndex = openingTag[0].length;

  let depth = 1;
  let nextTag: RegExpExecArray | null;

  while ((nextTag = matchingTags.exec(remaining)) !== null) {
    depth += nextTag[1] ? -1 : 1;

    if (depth !== 0) {
      continue;
    }

    const content = remaining.slice(0, matchingTags.lastIndex);

    return pushInlineToken(
      state,
      'otw_html',
      content,
      state.pos + content.length,
      silent,
    );
  }

  return false;
}
