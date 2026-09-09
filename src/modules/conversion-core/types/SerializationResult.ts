import { ConversionDiagnostic } from './ConversionDiagnostic';

export type SerializationResult = {
  text: string;
  diagnostics: ConversionDiagnostic[];
};
