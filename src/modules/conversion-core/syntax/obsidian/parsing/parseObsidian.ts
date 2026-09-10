import type { ParsedDocument } from '../../../model/ast/documents/ParsedDocument';
import { createObsidianParser } from './createObsidianParser';
import type { ConversionDiagnostic } from '../../../conversion/diagnostics/types/ConversionDiagnostic';
import type { ParseContext } from '../types/parsing/ParseContext';
import { collectBlocks } from './blocks/collectBlocks';
import { collectPreservationDiagnostics } from './diagnostics/collectPreservationDiagnostics';
import { lexSource } from '../../../lexing/lexSource';

export function parseObsidian(source: string): ParsedDocument {
  const markdown = createObsidianParser();
  const lineOffsets = [0];

  for (let position = 0; position < source.length; position++) {
    if (source[position] === '\n') {
      lineOffsets.push(position + 1);
    }
  }

  const diagnostics: ConversionDiagnostic[] = [];
  const environment = {};

  const context: ParseContext = {
    source,
    lineOffsets,
    diagnostics,
    markdown,
    environment,
  };

  const markdownTokens = markdown.parse(source, environment);
  const blocks = collectBlocks(markdownTokens, { position: 0 }, context);

  collectPreservationDiagnostics(blocks, context);

  return {
    dialect: 'obsidian',
    source,
    blocks,
    tokens: lexSource(source, 'obsidian'),
    diagnostics,
  };
}
