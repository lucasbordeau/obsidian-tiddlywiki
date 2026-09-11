import type { ConversionDiagnostic } from '../../../conversion/ConversionDiagnostic';
import MarkdownIt from 'markdown-it';

export type ParseContext = {
  source: string;
  lineOffsets: number[];
  diagnostics: ConversionDiagnostic[];
  markdown: MarkdownIt;
  environment: Record<string, unknown>;
};
