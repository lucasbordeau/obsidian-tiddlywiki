import type { TiddlyWikiRangedNode } from '../../types/TiddlyWikiRangedNode';
import type { TiddlyWikiSerializationContext } from './TiddlyWikiSerializationContext';

export function reportTiddlyWikiSerializationWarning(
  this: TiddlyWikiSerializationContext,
  node: TiddlyWikiRangedNode,
  code: string,
  message: string,
): void {
  this.diagnostics.push({
    code,
    message,
    severity: 'warning',
    range: node.range ?? { start: 0, end: this.document.source.length },
  });
}
