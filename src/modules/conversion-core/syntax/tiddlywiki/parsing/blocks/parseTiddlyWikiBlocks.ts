import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiBlockState } from './TiddlyWikiBlockState';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';
import { matchTiddlyWikiStyledOrTypedBlock } from './matchTiddlyWikiStyledOrTypedBlock';
import { matchTiddlyWikiConditionalBlock } from './matchTiddlyWikiConditionalBlock';
import { matchTiddlyWikiPreservationBlock } from './matchTiddlyWikiPreservationBlock';
import { matchTiddlyWikiCodeBlock } from './matchTiddlyWikiCodeBlock';
import { matchTiddlyWikiQuoteBlock } from './matchTiddlyWikiQuoteBlock';
import { matchTiddlyWikiHeadingBlock } from './matchTiddlyWikiHeadingBlock';
import { matchTiddlyWikiThematicBreak } from './matchTiddlyWikiThematicBreak';
import { matchTiddlyWikiListBlock } from './matchTiddlyWikiListBlock';
import { matchTiddlyWikiTableBlock } from './matchTiddlyWikiTableBlock';
import { matchTiddlyWikiHtmlBlock } from './matchTiddlyWikiHtmlBlock';
import { matchTiddlyWikiParagraphBlock } from './matchTiddlyWikiParagraphBlock';

export function parseTiddlyWikiBlocks(
  this: TiddlyWikiParsingContext,
  firstLine: number,
  endLine: number,
): BlockNode[] {
  const leadingPragma =
    firstLine === 0 &&
    /^(?:\s|<!--[\s\S]*?-->)*\\(?:define|procedure|function|widget|rules|parameters|import|whitespace|parsermode)\b/.test(
      this.source,
    );

  if (leadingPragma) {
    return [
      this.rawBlock(
        0,
        this.source.length,
        'A TiddlyWiki pragma changes the surrounding syntax or wiki context.',
      ),
    ];
  }

  const blocks: BlockNode[] = [];
  let lineIndex = firstLine;

  while (lineIndex < endLine) {
    const line = this.lines[lineIndex];

    if (!line.text.trim()) {
      lineIndex++;

      continue;
    }

    const indentation = line.text.length - line.text.trimStart().length;

    const state: TiddlyWikiBlockState = {
      lineIndex,
      endLine,
      line,
      start: line.start + indentation,
      text: line.text.slice(indentation),
    };

    const matched =
      matchTiddlyWikiStyledOrTypedBlock.call(this, state) ??
      matchTiddlyWikiConditionalBlock.call(this, state) ??
      matchTiddlyWikiPreservationBlock.call(this, state) ??
      matchTiddlyWikiCodeBlock.call(this, state) ??
      matchTiddlyWikiQuoteBlock.call(this, state) ??
      matchTiddlyWikiHeadingBlock.call(this, state) ??
      matchTiddlyWikiThematicBreak.call(this, state) ??
      matchTiddlyWikiListBlock.call(this, state) ??
      matchTiddlyWikiTableBlock.call(this, state) ??
      matchTiddlyWikiHtmlBlock.call(this, state) ??
      matchTiddlyWikiParagraphBlock.call(this, state);

    if (!matched) {
      break;
    }

    blocks.push(...matched.blocks);

    lineIndex = matched.nextLine;
  }

  return blocks;
}
