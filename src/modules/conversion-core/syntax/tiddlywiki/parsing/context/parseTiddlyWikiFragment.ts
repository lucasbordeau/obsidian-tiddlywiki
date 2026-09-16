import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';
import { shiftTiddlyWikiSourceRanges } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/shiftTiddlyWikiSourceRanges';

export function parseTiddlyWikiFragment(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): BlockNode[] {
  const fragment = this.createParser(this.source.slice(start, end));

  const blocks = fragment.parseBlocks(0, fragment.lines.length);

  shiftTiddlyWikiSourceRanges(blocks, start);

  for (const diagnostic of fragment.diagnostics) {
    this.diagnostics.push({
      ...diagnostic,
      range: {
        start: diagnostic.range.start + start,
        end: diagnostic.range.end + start,
      },
    });
  }

  return blocks;
}
