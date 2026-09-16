import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';
import { Dialect } from '@/modules/conversion-core/model/Dialect';
import { SyntaxToken } from '@/modules/conversion-core/model/SyntaxToken';

export type ParsedDocument = {
  dialect: Dialect;
  source: string;
  blocks: BlockNode[];
  tokens: SyntaxToken[];
  diagnostics: ConversionDiagnostic[];
};
