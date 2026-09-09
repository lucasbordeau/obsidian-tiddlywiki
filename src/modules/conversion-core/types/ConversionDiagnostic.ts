import { SourceRange } from './SourceRange';

export type ConversionDiagnostic = {
  code: string;
  message: string;
  severity: 'warning' | 'error';
  range: SourceRange;
};
