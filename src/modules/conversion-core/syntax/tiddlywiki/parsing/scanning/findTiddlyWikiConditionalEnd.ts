import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function findTiddlyWikiConditionalEnd(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): number {
  const markers = /<%\s*(if\s|endif\s*%>)/g;

  markers.lastIndex = start;

  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = markers.exec(this.source))) {
    if (match.index >= end) {
      break;
    }

    if (match[1].startsWith('if')) {
      depth++;
    } else {
      depth--;
    }

    if (depth === 0) {
      return Math.min(end, markers.lastIndex);
    }
  }

  return end;
}
