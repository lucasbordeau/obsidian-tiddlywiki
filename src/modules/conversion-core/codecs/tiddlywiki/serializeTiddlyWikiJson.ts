import type { CodecResult } from '../CodecResult';
import { createCodecDiagnostic } from '../createCodecDiagnostic';
import { parseTiddlyWikiJson } from './parseTiddlyWikiJson';
import type { TiddlerFields } from './TiddlerFields';

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
