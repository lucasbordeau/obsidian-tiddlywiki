import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { decodePreservedSource } from '@/modules/conversion-core/preservation/source/decodePreservedSource';
import { TiddlyWikiBlockState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockState';
import { TiddlyWikiBlockMatch } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiPreservationBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { line, start, text } = state;

  const capsule = decodePreservedSource(text);

  if (capsule) {
    blocks.push({
      type: 'raw',
      ...capsule,
      range: { start, end: line.end },
    });

    lineIndex++;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
