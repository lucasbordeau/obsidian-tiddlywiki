import { ConversionDiagnostic } from '../types/ConversionDiagnostic';

export type CodecResult<Value> = {
  value?: Value;
  diagnostics: ConversionDiagnostic[];
};
