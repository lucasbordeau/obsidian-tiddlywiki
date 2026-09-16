import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiBlockState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';
import { matchTiddlyWikiStyledOrTypedBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiStyledOrTypedBlock';
import { matchTiddlyWikiConditionalBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiConditionalBlock';
import { matchTiddlyWikiPreservationBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiPreservationBlock';
import { matchTiddlyWikiCodeBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiCodeBlock';
import { matchTiddlyWikiQuoteBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiQuoteBlock';
import { matchTiddlyWikiHeadingBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiHeadingBlock';
import { matchTiddlyWikiThematicBreak } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiThematicBreak';
import { matchTiddlyWikiListBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiListBlock';
import { matchTiddlyWikiTableBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiTableBlock';
import { matchTiddlyWikiHtmlBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiHtmlBlock';
import { matchTiddlyWikiParagraphBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/matchTiddlyWikiParagraphBlock';

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
