import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiSystemLink(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);
  const systemLink = /^(~?)(\$:\/[\p{L}\p{N}/._-]+)/u.exec(tail);

  if (systemLink) {
    const target = systemLink[2];
    const range = { start, end: start + systemLink[0].length };

    const node: InlineNode = systemLink[1]
      ? { type: 'text', value: target, range }
      : {
          type: 'link',
          target,
          label: [{ type: 'text', value: target }],
          external: false,
          range,
        };

    return { node, end: range.end };
  }

  return undefined;
}
