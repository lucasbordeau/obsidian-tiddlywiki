import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { ConversionDiagnostic } from '../../../../conversion/ConversionDiagnostic';
import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { SourceRange } from '../../../../model/SourceRange';
import type { TiddlyWikiSourceLine } from '../../types/TiddlyWikiSourceLine';
import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';

export type TiddlyWikiParsingContext = {
  source: string;
  lines: TiddlyWikiSourceLine[];
  diagnostics: ConversionDiagnostic[];
  createParser(source: string): TiddlyWikiParsingContext;
  warn(code: string, message: string, range: SourceRange): void;
  rawBlock(start: number, end: number, reason: string): BlockNode;
  rawInline(start: number, end: number, reason: string): InlineNode;
  parseBlocks(firstLine: number, endLine: number): BlockNode[];
  parseLineQuotes(firstLine: number, endLine: number): BlockNode[];
  parseLists(firstLine: number, endLine: number): BlockNode[];
  parseTable(firstLine: number, endLine: number): BlockNode;
  splitTableCells(start: number, end: number): SourceRange[];
  parseInline(start: number, end: number, depth?: number): InlineNode[];
  matchInline(
    start: number,
    end: number,
    depth: number,
  ): TiddlyWikiInlineMatch | undefined;
  matchImage(start: number, end: number): TiddlyWikiInlineMatch;
  findProtectedEnd(start: number, end: number): number;
  findParagraphEnd(start: number, end: number): number;
  findImageContentStart(start: number, end: number): number;
  findFormattingEnd(start: number, end: number, marker: string): number;
  findConditionalEnd(start: number, end: number): number;
  findDelimitedEnd(
    start: number,
    end: number,
    opening: string,
    closing: string,
  ): number;
  findHtmlEnd(start: number, end: number): number;
  findTagEnd(start: number, end: number): number;
  parseStaticAttributes(
    start: number,
    end: number,
  ): Record<string, string> | undefined;
  parseStaticHtmlInline(
    start: number,
    end: number,
    depth: number,
  ): InlineNode | undefined;
  parseStaticHtmlBlock(start: number, end: number): BlockNode | undefined;
  parseFragment(start: number, end: number): BlockNode[];
};
