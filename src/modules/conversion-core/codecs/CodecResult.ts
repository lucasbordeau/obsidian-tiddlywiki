import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';

export type CodecResult<Value> = {
  value?: Value;
  diagnostics: ConversionDiagnostic[];
};
