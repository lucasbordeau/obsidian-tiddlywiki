import { BlockNode } from './BlockNode';
import { ConversionDiagnostic } from './ConversionDiagnostic';
import { Dialect } from './Dialect';
import { SyntaxToken } from './SyntaxToken';

export type ParsedDocument = {
  dialect: Dialect;
  source: string;
  blocks: BlockNode[];
  tokens: SyntaxToken[];
  diagnostics: ConversionDiagnostic[];
};
