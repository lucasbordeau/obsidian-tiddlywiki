import type { BlockNode } from '../../../../model/blocks/BlockNode';
import { decodePreservedSource } from '../../../../preservation/source/decodePreservedSource';
import type { TiddlyWikiBlockState } from './TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from './TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

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
