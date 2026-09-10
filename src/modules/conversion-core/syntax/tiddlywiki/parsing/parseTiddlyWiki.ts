import type { ParsedDocument } from '../../../model/ast/documents/ParsedDocument';
import { lexSource } from '../../../lexing/lexSource';
import { createTiddlyWikiParsingContext } from './context/createTiddlyWikiParsingContext';

export function parseTiddlyWiki(source: string): ParsedDocument {
  const parser = createTiddlyWikiParsingContext(source);

  return {
    dialect: 'tiddlywiki',
    source,
    blocks: parser.parseBlocks(0, parser.lines.length),
    tokens: lexSource(source, 'tiddlywiki'),
    diagnostics: parser.diagnostics,
  };
}
