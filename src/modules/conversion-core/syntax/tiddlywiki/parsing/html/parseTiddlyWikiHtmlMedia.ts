import { decodeXML } from 'entities';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiHtmlState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/TiddlyWikiHtmlState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';
import { isSafeRemoteMediaUrl } from '@/modules/conversion-core/validation/isSafeRemoteMediaUrl';

export function parseTiddlyWikiHtmlMedia(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
): InlineNode | undefined {
  const { start, end, tag, openEnd, closeStart, attributes, range } = state;
  const opening = this.source.slice(start, openEnd);
  const closing = this.source.slice(closeStart, end);

  const canonicalAttributes =
    /^<(?:audio|video)\s+controls="controls"(?:\s+preload="none")?\s+src="[^"]*"\s*>$/i.test(
      opening,
    );

  const canonicalClosing = new RegExp(`^</${tag}\\s*>$`, 'i').test(closing);
  const emptyMediaBody = closeStart === openEnd;
  const mediaSource = decodeXML(attributes.src ?? '');
  const safeSource = isSafeRemoteMediaUrl(mediaSource);

  const supportedMedia =
    canonicalAttributes &&
    canonicalClosing &&
    emptyMediaBody &&
    attributes.controls === 'controls' &&
    (attributes.preload === undefined || attributes.preload === 'none') &&
    safeSource;

  if (!supportedMedia) {
    return undefined;
  }

  return {
    type: 'embed',
    target: mediaSource,
    alt: '',
    kind: tag === 'audio' ? 'audio' : 'video',
    range,
  };
}
