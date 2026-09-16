import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';
import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { collectBlocks } from '@/modules/conversion-core/syntax/obsidian/parsing/blocks/collectBlocks';
import { collectPreservationDiagnostics } from '@/modules/conversion-core/syntax/obsidian/parsing/collectPreservationDiagnostics';
import { lexSource } from '@/modules/conversion-core/lexing/lexSource';

export function parseObsidian(source: string): ParsedDocument {
  const obsidianParser = createObsidianParser();
  const lineOffsets = [0];

  for (let position = 0; position < source.length; position++) {
    if (source[position] === '\n') {
      lineOffsets.push(position + 1);
    }
  }

  const diagnostics: ConversionDiagnostic[] = [];
  const parserEnvironment = {};

  const parsingContext: ParseContext = {
    source,
    lineOffsets,
    diagnostics,
    obsidianParser,
    parserEnvironment,
  };

  const obsidianTokens = obsidianParser.parse(source, parserEnvironment);
  const blocks = collectBlocks(obsidianTokens, { position: 0 }, parsingContext);

  collectPreservationDiagnostics(blocks, parsingContext);

  return {
    dialect: 'obsidian',
    source,
    blocks,
    tokens: lexSource(source, 'obsidian'),
    diagnostics,
  };
}
