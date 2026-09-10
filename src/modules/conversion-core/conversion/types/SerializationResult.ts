import type { ConversionDiagnostic } from '../diagnostics/types/ConversionDiagnostic';

export type SerializationResult = {
  text: string;
  diagnostics: ConversionDiagnostic[];
};
