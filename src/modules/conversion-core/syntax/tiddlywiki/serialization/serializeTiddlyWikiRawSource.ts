import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { encodePreservedSource } from '@/modules/conversion-core/preservation/source/encodePreservedSource';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

function getObsidianYouTubeVideoId(source: string): string | undefined {
  const match =
    /^!\[\]\(https:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)\)$/.exec(
      source,
    );

  return match?.[1];
}

export function serializeTiddlyWikiRawSource(
  this: TiddlyWikiSerializationContext,
  node: Extract<BlockNode | InlineNode, { type: 'raw' }>,
): string {
  if (node.dialect === 'tiddlywiki') {
    return node.value;
  }

  const youtubeVideoId = getObsidianYouTubeVideoId(node.value);

  if (youtubeVideoId) {
    return `<iframe src="https://www.youtube.com/embed/${youtubeVideoId}" width="560" height="315" allowfullscreen></iframe>`;
  }

  this.diagnose(node, 'tw-preserved-foreign-source', node.reason);

  return encodePreservedSource({
    dialect: node.dialect,
    value: node.value,
    reason: node.reason,
  });
}
