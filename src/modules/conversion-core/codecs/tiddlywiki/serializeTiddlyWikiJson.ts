import { CodecResult } from '@/modules/conversion-core/codecs/CodecResult';
import { createCodecDiagnostic } from '@/modules/conversion-core/codecs/createCodecDiagnostic';
import { parseTiddlyWikiJson } from '@/modules/conversion-core/codecs/tiddlywiki/parseTiddlyWikiJson';
import { TiddlerFields } from '@/modules/conversion-core/codecs/tiddlywiki/TiddlerFields';

export function serializeTiddlyWikiJson(
  tiddlers: TiddlerFields[],
): CodecResult<string> {
  try {
    const source = JSON.stringify(tiddlers, null, 2);

    const validation = parseTiddlyWikiJson(source);

    if (!validation.value) {
      return { diagnostics: validation.diagnostics };
    }

    return { value: source, diagnostics: [] };
  } catch {
    return {
      diagnostics: [
        createCodecDiagnostic(
          'invalid-tiddler-container',
          'The tiddlers cannot be serialized as JSON.',
          0,
        ),
      ],
    };
  }
}
