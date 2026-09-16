import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';

export function createCodecDiagnostic(
  code: string,
  message: string,
  end: number,
  severity: 'warning' | 'error' = 'error',
): ConversionDiagnostic {
  return { code, message, severity, range: { start: 0, end } };
}
