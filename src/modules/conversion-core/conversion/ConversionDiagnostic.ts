import type { SourceRange } from '../model/SourceRange';

export type ConversionDiagnostic = {
  code: string;
  message: string;
  severity: 'warning' | 'error';
  range: SourceRange;
};
