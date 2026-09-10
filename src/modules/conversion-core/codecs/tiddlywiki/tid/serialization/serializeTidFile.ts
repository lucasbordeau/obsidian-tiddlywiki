import type { CodecResult } from '../../../results/CodecResult';
import { createCodecDiagnostic } from '../../../diagnostics/createCodecDiagnostic';
import { parseTiddlyWikiJson } from '../../json/parsing/parseTiddlyWikiJson';
import type { TiddlerFields } from '../../fields/types/TiddlerFields';

export function serializeTidFile(tiddler: TiddlerFields): CodecResult<string> {
  const validation = parseTiddlyWikiJson(JSON.stringify([tiddler]));

  if (!validation.value) {
    return { diagnostics: validation.diagnostics };
  }

  const headers: string[] = [];

  const fieldNames = Object.keys(tiddler)
    .filter((name) => name !== 'text')
    .sort();

  for (const name of fieldNames) {
    const value = tiddler[name];

    if (value === undefined) {
      continue;
    }

    const isRepresentable =
      !/[\r\n:]/.test(name) &&
      name.trim() === name &&
      !/[\r\n]/.test(value) &&
      value.trim() === value;

    if (!isRepresentable) {
      return {
        diagnostics: [
          createCodecDiagnostic(
            'unrepresentable-tid-field',
            `Field ${name} cannot be represented losslessly in a .tid header; use JSON.`,
            0,
          ),
        ],
      };
    }

    headers.push(`${name}: ${value}`);
  }

  return { value: `${headers.join('\n')}\n\n${tiddler.text}`, diagnostics: [] };
}
