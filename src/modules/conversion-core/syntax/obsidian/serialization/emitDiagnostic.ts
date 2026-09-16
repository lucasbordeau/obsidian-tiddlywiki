import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

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
