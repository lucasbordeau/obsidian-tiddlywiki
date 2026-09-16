import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { emitDiagnostic } from '@/modules/conversion-core/syntax/obsidian/serialization/emitDiagnostic';
import { encodePreservedSource } from '@/modules/conversion-core/preservation/source/encodePreservedSource';

function getTiddlyWikiYouTubeVideoId(source: string): string | undefined {
  const match =
    /^<iframe\s+src="https:\/\/(?:www\.)?youtube\.com\/embed\/([\w-]+)"\s+width="560"\s+height="315"\s+allowfullscreen><\/iframe>$/.exec(
      source,
    );

  return match?.[1];
}

export function emitRaw(
  node: Extract<InlineNode | BlockNode, { type: 'raw' }>,
  context: SerializationContext,
): string {
  if (node.dialect === 'obsidian') {
    return node.value;
  }

  const youtubeVideoId = getTiddlyWikiYouTubeVideoId(node.value);

  if (youtubeVideoId) {
    return `![](https://www.youtube.com/watch?v=${youtubeVideoId})`;
  }

  const preserveUnsupportedSource =
    context.options.preserveUnsupportedSource !== false;

  emitDiagnostic(
    context,
    preserveUnsupportedSource ? 'PRESERVED_SOURCE' : 'OMITTED_SOURCE',
    preserveUnsupportedSource
      ? `${node.reason} is retained as TiddlyWiki source in a preservation comment.`
      : `${node.reason} is omitted from the Obsidian output.`,
    node.range,
  );

  if (!preserveUnsupportedSource) {
    return '';
  }

  return encodePreservedSource({
    dialect: node.dialect,
    value: node.value,
    reason: node.reason,
  });
}
