import type { BlockNode } from '../blocks/BlockNode';
import type { ConversionDiagnostic } from '../../../conversion/diagnostics/types/ConversionDiagnostic';
import type { Dialect } from '../../source/Dialect';
import type { SyntaxToken } from '../../source/SyntaxToken';

export type ParsedDocument = {
  dialect: Dialect;
  source: string;
  blocks: BlockNode[];
  tokens: SyntaxToken[];
  diagnostics: ConversionDiagnostic[];
};
