import { reportTiddlyWikiParsingWarning } from './reportTiddlyWikiParsingWarning';
import { preserveTiddlyWikiBlock } from '../preserveTiddlyWikiBlock';
import { preserveTiddlyWikiInline } from '../preserveTiddlyWikiInline';
import { parseTiddlyWikiBlocks } from '../blocks/parseTiddlyWikiBlocks';
import { parseTiddlyWikiLineQuotes } from '../blocks/parseTiddlyWikiLineQuotes';
import { parseTiddlyWikiLists } from '../blocks/parseTiddlyWikiLists';
import { parseTiddlyWikiTable } from '../blocks/parseTiddlyWikiTable';
import { splitTiddlyWikiTableCells } from '../blocks/splitTiddlyWikiTableCells';
import { parseTiddlyWikiInlines } from '../inlines/parseTiddlyWikiInlines';
import { matchTiddlyWikiInline } from '../inlines/matchTiddlyWikiInline';
import { matchTiddlyWikiImage } from '../inlines/matchTiddlyWikiImage';
import { findTiddlyWikiProtectedEnd } from '../scanning/findTiddlyWikiProtectedEnd';
import { findTiddlyWikiParagraphEnd } from '../blocks/findTiddlyWikiParagraphEnd';
import { findTiddlyWikiImageContentStart } from '../inlines/findTiddlyWikiImageContentStart';
import { findTiddlyWikiFormattingEnd } from '../inlines/findTiddlyWikiFormattingEnd';
import { findTiddlyWikiConditionalEnd } from '../scanning/findTiddlyWikiConditionalEnd';
import { findTiddlyWikiDelimitedEnd } from '../scanning/findTiddlyWikiDelimitedEnd';
import { findTiddlyWikiHtmlEnd } from '../html/findTiddlyWikiHtmlEnd';
import { findTiddlyWikiTagEnd } from '../html/findTiddlyWikiTagEnd';
import { parseTiddlyWikiStaticAttributes } from '../html/parseTiddlyWikiStaticAttributes';
import { parseTiddlyWikiStaticHtmlInline } from '../html/parseTiddlyWikiStaticHtmlInline';
import { parseTiddlyWikiStaticHtmlBlock } from '../html/parseTiddlyWikiStaticHtmlBlock';
import { parseTiddlyWikiFragment } from './parseTiddlyWikiFragment';
import type { TiddlyWikiParsingContext } from './TiddlyWikiParsingContext';
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
