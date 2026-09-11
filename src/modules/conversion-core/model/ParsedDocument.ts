import type { BlockNode } from './blocks/BlockNode';
import type { ConversionDiagnostic } from '../conversion/ConversionDiagnostic';
import type { Dialect } from './Dialect';
import type { SyntaxToken } from './SyntaxToken';

export type ParsedDocument = {
  dialect: Dialect;
  source: string;
  blocks: BlockNode[];
  tokens: SyntaxToken[];
  diagnostics: ConversionDiagnostic[];
};
