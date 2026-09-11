import { convertText } from '../conversion/convertText';
import type { SerializationResult } from '../conversion/SerializationResult';
import { createCodecDiagnostic } from '../codecs/createCodecDiagnostic';
import { isMarkdownContentType } from './isMarkdownContentType';

export function convertTiddlerBody(
  text: string,
  contentType: string | undefined,
  toMarkdown: boolean,
): SerializationResult {
  const isWikitext =
    contentType === undefined ||
    contentType === '' ||
    contentType === 'text' ||
    contentType === 'text/vnd.tiddlywiki';

  if (isWikitext) {
    return toMarkdown
      ? convertText(text, 'tiddlywiki', 'obsidian')
      : convertText(text, 'obsidian', 'tiddlywiki');
  }

  if (isMarkdownContentType(contentType)) {
    return { text, diagnostics: [] };
  }

  return {
    text,
    diagnostics: [
      createCodecDiagnostic(
        'preserved-content-type',
        `Content of type ${contentType} is preserved verbatim.`,
        text.length,
        'warning',
      ),
    ],
  };
}
