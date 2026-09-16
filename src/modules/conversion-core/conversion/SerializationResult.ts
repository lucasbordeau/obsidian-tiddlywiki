import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';

export type SerializationResult = {
  text: string;
  diagnostics: ConversionDiagnostic[];
};
