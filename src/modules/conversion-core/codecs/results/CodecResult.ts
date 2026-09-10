import type { ConversionDiagnostic } from '../../conversion/diagnostics/types/ConversionDiagnostic';

export type CodecResult<Value> = {
  value?: Value;
  diagnostics: ConversionDiagnostic[];
};
