import { reportTiddlyWikiParsingWarning } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/reportTiddlyWikiParsingWarning';
import { preserveTiddlyWikiBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/preserveTiddlyWikiBlock';
import { preserveTiddlyWikiInline } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/preserveTiddlyWikiInline';
import { parseTiddlyWikiBlocks } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/parseTiddlyWikiBlocks';
import { parseTiddlyWikiLineQuotes } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/parseTiddlyWikiLineQuotes';
import { parseTiddlyWikiLists } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/parseTiddlyWikiLists';
import { parseTiddlyWikiTable } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/parseTiddlyWikiTable';
import { splitTiddlyWikiTableCells } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/splitTiddlyWikiTableCells';
import { parseTiddlyWikiInlines } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/parseTiddlyWikiInlines';
import { matchTiddlyWikiInline } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiInline';
import { matchTiddlyWikiImage } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/matchTiddlyWikiImage';
import { findTiddlyWikiProtectedEnd } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/scanning/findTiddlyWikiProtectedEnd';
import { findTiddlyWikiParagraphEnd } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/findTiddlyWikiParagraphEnd';
import { findTiddlyWikiImageContentStart } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/findTiddlyWikiImageContentStart';
import { findTiddlyWikiFormattingEnd } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/inlines/findTiddlyWikiFormattingEnd';
import { findTiddlyWikiConditionalEnd } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/scanning/findTiddlyWikiConditionalEnd';
import { findTiddlyWikiDelimitedEnd } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/scanning/findTiddlyWikiDelimitedEnd';
import { findTiddlyWikiHtmlEnd } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/findTiddlyWikiHtmlEnd';
import { findTiddlyWikiTagEnd } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/findTiddlyWikiTagEnd';
import { parseTiddlyWikiStaticAttributes } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiStaticAttributes';
import { parseTiddlyWikiStaticHtmlInline } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiStaticHtmlInline';
import { parseTiddlyWikiStaticHtmlBlock } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/parseTiddlyWikiStaticHtmlBlock';
import { parseTiddlyWikiFragment } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/parseTiddlyWikiFragment';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';
import { readTiddlyWikiSourceLines } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/readTiddlyWikiSourceLines';

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
