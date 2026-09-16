import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

export type ConversionDiagnostic = {
  code: string;
  message: string;
  severity: 'warning' | 'error';
  range: SourceRange;
};
