import { TiddlyWikiRangedNode } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiRangedNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

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
