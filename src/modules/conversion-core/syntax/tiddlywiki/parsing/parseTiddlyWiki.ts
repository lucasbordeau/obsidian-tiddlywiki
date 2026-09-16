import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { createTiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/createTiddlyWikiParsingContext';

export function parseTiddlyWiki(source: string): ParsedDocument {
  const parsingContext = createTiddlyWikiParsingContext(source);

  return {
    dialect: 'tiddlywiki',
    source,
    blocks: parsingContext.parseBlocks(0, parsingContext.lines.length),
    tokens: lexSource(source, 'tiddlywiki'),
    diagnostics: parsingContext.diagnostics,
  };
}
