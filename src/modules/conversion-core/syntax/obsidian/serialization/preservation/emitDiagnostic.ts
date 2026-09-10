import type { SerializationContext } from '../../types/serialization/SerializationContext';
import type { SourceRange } from '../../../../model/source/SourceRange';

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
