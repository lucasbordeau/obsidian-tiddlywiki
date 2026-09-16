import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';
import MarkdownIt from 'markdown-it';

export type ParseContext = {
  source: string;
  lineOffsets: number[];
  diagnostics: ConversionDiagnostic[];
  obsidianParser: MarkdownIt;
  parserEnvironment: Record<string, unknown>;
};
