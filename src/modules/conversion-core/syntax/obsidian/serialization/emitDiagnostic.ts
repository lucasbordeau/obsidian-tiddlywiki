import type { SerializationContext } from '../types/SerializationContext';
import type { SourceRange } from '../../../model/SourceRange';

export function emitDiagnostic(
  context: SerializationContext,
  code: string,
  message: string,
  range?: SourceRange,
): void {
  context.diagnostics.push({
    code,
    message,
    severity: 'warning',
    range: range ?? { start: 0, end: context.document.source.length },
  });
}
