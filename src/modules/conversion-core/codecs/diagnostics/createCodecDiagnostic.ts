import type { ConversionDiagnostic } from '../../conversion/diagnostics/types/ConversionDiagnostic';

export function createCodecDiagnostic(
  code: string,
  message: string,
  end: number,
  severity: 'warning' | 'error' = 'error',
): ConversionDiagnostic {
  return { code, message, severity, range: { start: 0, end } };
}
