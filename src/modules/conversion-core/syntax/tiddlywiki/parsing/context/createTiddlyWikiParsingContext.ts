import { reportTiddlyWikiParsingWarning } from './reportTiddlyWikiParsingWarning';
import { preserveTiddlyWikiBlock } from '../preservation/preserveTiddlyWikiBlock';
import { preserveTiddlyWikiInline } from '../preservation/preserveTiddlyWikiInline';
import { parseTiddlyWikiBlocks } from '../blocks/parseTiddlyWikiBlocks';
import { parseTiddlyWikiLineQuotes } from '../blocks/quotes/parseTiddlyWikiLineQuotes';
import { parseTiddlyWikiLists } from '../blocks/lists/parseTiddlyWikiLists';
import { parseTiddlyWikiTable } from '../blocks/tables/parseTiddlyWikiTable';
import { splitTiddlyWikiTableCells } from '../blocks/tables/splitTiddlyWikiTableCells';
import { parseTiddlyWikiInlines } from '../inlines/parseTiddlyWikiInlines';
import { matchTiddlyWikiInline } from '../inlines/matchTiddlyWikiInline';
import { matchTiddlyWikiImage } from '../inlines/images/matchTiddlyWikiImage';
import { findTiddlyWikiProtectedEnd } from '../scanning/findTiddlyWikiProtectedEnd';
import { findTiddlyWikiParagraphEnd } from '../blocks/paragraphs/findTiddlyWikiParagraphEnd';
import { findTiddlyWikiImageContentStart } from '../inlines/images/findTiddlyWikiImageContentStart';
import { findTiddlyWikiFormattingEnd } from '../inlines/formatting/findTiddlyWikiFormattingEnd';
import { findTiddlyWikiConditionalEnd } from '../scanning/conditionals/findTiddlyWikiConditionalEnd';
import { findTiddlyWikiDelimitedEnd } from '../scanning/delimiters/findTiddlyWikiDelimitedEnd';
import { findTiddlyWikiHtmlEnd } from '../html/scanning/findTiddlyWikiHtmlEnd';
import { findTiddlyWikiTagEnd } from '../html/scanning/findTiddlyWikiTagEnd';
import { parseTiddlyWikiStaticAttributes } from '../html/attributes/parseTiddlyWikiStaticAttributes';
import { parseTiddlyWikiStaticHtmlInline } from '../html/inlines/parseTiddlyWikiStaticHtmlInline';
import { parseTiddlyWikiStaticHtmlBlock } from '../html/blocks/parseTiddlyWikiStaticHtmlBlock';
import { parseTiddlyWikiFragment } from './parseTiddlyWikiFragment';
import type { TiddlyWikiParsingContext } from './types/TiddlyWikiParsingContext';
import { readTiddlyWikiSourceLines } from './readTiddlyWikiSourceLines';

export function createTiddlyWikiParsingContext(
  source: string,
): TiddlyWikiParsingContext {
  return {
    source,
    lines: readTiddlyWikiSourceLines(source),
    diagnostics: [],
    createParser: createTiddlyWikiParsingContext,
    warn: reportTiddlyWikiParsingWarning,
    rawBlock: preserveTiddlyWikiBlock,
    rawInline: preserveTiddlyWikiInline,
    parseBlocks: parseTiddlyWikiBlocks,
    parseLineQuotes: parseTiddlyWikiLineQuotes,
    parseLists: parseTiddlyWikiLists,
    parseTable: parseTiddlyWikiTable,
    splitTableCells: splitTiddlyWikiTableCells,
    parseInline: parseTiddlyWikiInlines,
    matchInline: matchTiddlyWikiInline,
    matchImage: matchTiddlyWikiImage,
    findProtectedEnd: findTiddlyWikiProtectedEnd,
    findParagraphEnd: findTiddlyWikiParagraphEnd,
    findImageContentStart: findTiddlyWikiImageContentStart,
    findFormattingEnd: findTiddlyWikiFormattingEnd,
    findConditionalEnd: findTiddlyWikiConditionalEnd,
    findDelimitedEnd: findTiddlyWikiDelimitedEnd,
    findHtmlEnd: findTiddlyWikiHtmlEnd,
    findTagEnd: findTiddlyWikiTagEnd,
    parseStaticAttributes: parseTiddlyWikiStaticAttributes,
    parseStaticHtmlInline: parseTiddlyWikiStaticHtmlInline,
    parseStaticHtmlBlock: parseTiddlyWikiStaticHtmlBlock,
    parseFragment: parseTiddlyWikiFragment,
  };
}
