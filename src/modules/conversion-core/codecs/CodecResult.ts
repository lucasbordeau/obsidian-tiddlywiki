import type { ConversionDiagnostic } from '../conversion/ConversionDiagnostic';

export type CodecResult<Value> = {
  value?: Value;
  diagnostics: ConversionDiagnostic[];
};
