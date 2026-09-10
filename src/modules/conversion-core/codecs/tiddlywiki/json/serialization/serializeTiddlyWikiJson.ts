import type { CodecResult } from '../../../results/CodecResult';
import { createCodecDiagnostic } from '../../../diagnostics/createCodecDiagnostic';
import { parseTiddlyWikiJson } from '../parsing/parseTiddlyWikiJson';
import type { TiddlerFields } from '../../fields/types/TiddlerFields';

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
