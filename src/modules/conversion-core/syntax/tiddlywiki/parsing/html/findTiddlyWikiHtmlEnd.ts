import { TIDDLYWIKI_VOID_ELEMENTS } from '@/modules/conversion-core/syntax/tiddlywiki/constants/TiddlyWikiVoidElements.const';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function findTiddlyWikiHtmlEnd(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): number {
  if (this.source.startsWith('<!--', start)) {
    return this.findDelimitedEnd(start, end, '<!--', '-->');
  }

  const opening = /^<([a-z][\w:-]*|\$[\w-]+)\b/i.exec(
    this.source.slice(start, end),
  );

  if (!opening) {
    return start;
  }

  const tagEnd = this.findTagEnd(start + opening[0].length, end);

  if (tagEnd < 0) {
    return end;
  }

  const tag = opening[1].toLowerCase();

  const selfClosing =
    /\/\s*>$/.test(this.source.slice(start, tagEnd)) ||
    TIDDLYWIKI_VOID_ELEMENTS.has(tag);

  if (selfClosing) {
    return tagEnd;
  }

  const tagPattern = new RegExp(
    '<(/?)' + tag.replace('$', '\\$') + '(?=[\\s/>])',
    'gi',
  );

  tagPattern.lastIndex = tagEnd;

  let nesting = 1;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(this.source))) {
    if (match.index >= end) {
      break;
    }

    const close = this.findTagEnd(tagPattern.lastIndex, end);

    if (close < 0) {
      return end;
    }

    if (match[1]) {
      nesting--;
    } else if (!/\/\s*>$/.test(this.source.slice(match.index, close))) {
      nesting++;
    }

    if (nesting === 0) {
      return close;
    }

    tagPattern.lastIndex = close;
  }

  return end;
}
