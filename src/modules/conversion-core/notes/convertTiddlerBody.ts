import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';
import { SerializationResult } from '@/modules/conversion-core/conversion/SerializationResult';
import { createCodecDiagnostic } from '@/modules/conversion-core/codecs/createCodecDiagnostic';
import { isMarkdownContentType } from '@/modules/conversion-core/notes/isMarkdownContentType';

export function convertTiddlerBody(
  text: string,
  contentType: string | undefined,
  toMarkdown: boolean,
  options: ConversionOptions = {},
): SerializationResult {
  const isWikitext =
    contentType === undefined ||
    contentType === '' ||
    contentType === 'text' ||
    contentType === 'text/vnd.tiddlywiki';

  if (isWikitext) {
    return toMarkdown
      ? convertText(text, 'tiddlywiki', 'obsidian', options)
      : convertText(text, 'obsidian', 'tiddlywiki', options);
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
