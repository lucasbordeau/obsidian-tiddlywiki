import { TIDDLYWIKI_BARE_EXTERNAL_LINK } from '../../constants/TiddlyWikiBareExternalLink.const';
import type { TiddlyWikiParsingContext } from '../context/types/TiddlyWikiParsingContext';

export function findTiddlyWikiProtectedEnd(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): number {
  const tail = this.source.slice(start, Math.min(end, start + 8));

  if (tail.startsWith('[img')) {
    const contentStart = this.findImageContentStart(start, end);
    const closing = this.source.indexOf(']]', contentStart + 1);

    return closing >= 0 && closing + 2 <= end ? closing + 2 : end;
  }

  const delimiters: [string, string][] = [
    ['<!--', '-->'],
    ['/%', '%/'],
    ['[[', ']]'],
    ['[ext[', ']]'],
    ['{{{', '}}}'],
    ['{{', '}}'],
    ['<<', '>>'],
    ['"""', '"""'],
    ['(((', ')))'],
    ['((', '))'],
  ];

  for (const [opening, closing] of delimiters) {
    if (tail.startsWith(opening)) {
      const final = this.findDelimitedEnd(start, end, opening, closing);

      const unclosedMacro =
        opening === '<<' && this.source.slice(final - 2, final) !== '>>';

      if (!unclosedMacro) {
        return final;
      }

      return start + 2;
    }
  }

  if (tail.startsWith('`')) {
    const marker = tail.startsWith('``') ? '``' : '`';
    const closing = this.source.indexOf(marker, start + marker.length);

    return closing >= 0 && closing + marker.length <= end
      ? closing + marker.length
      : end;
  }

  if (/^<%\s*if\s/.test(tail)) {
    return this.findConditionalEnd(start, end);
  }

  if (tail.startsWith('<')) {
    return this.findHtmlEnd(start, end);
  }

  const url = TIDDLYWIKI_BARE_EXTERNAL_LINK.exec(this.source.slice(start, end));

  if (url) {
    return start + url[0].length;
  }

  return start;
}
