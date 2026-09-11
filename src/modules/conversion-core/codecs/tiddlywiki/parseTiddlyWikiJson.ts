import { isRecord } from '../../validation/isRecord';
import { createCodecDiagnostic } from '../createCodecDiagnostic';
import type { CodecResult } from '../CodecResult';
import type { TiddlerFields } from './TiddlerFields';

export function parseTiddlyWikiJson(
  source: string,
): CodecResult<TiddlerFields[]> {
  let decoded: unknown;

  try {
    decoded = JSON.parse(source);
  } catch {
    return {
      diagnostics: [
        createCodecDiagnostic(
          'invalid-json',
          'Invalid TiddlyWiki JSON.',
          source.length,
        ),
      ],
    };
  }

  if (!Array.isArray(decoded)) {
    return {
      diagnostics: [
        createCodecDiagnostic(
          'invalid-tiddler-container',
          'Expected a JSON array of tiddlers.',
          source.length,
        ),
      ],
    };
  }

  const tiddlers: TiddlerFields[] = [];
  const diagnostics = [];
  const titles = new Set<string>();

  for (const [index, candidate] of decoded.entries()) {
    const hasStringFields =
      isRecord(candidate) &&
      Object.values(candidate).every((value) => typeof value === 'string');

    if (!hasStringFields || !isRecord(candidate)) {
      diagnostics.push(
        createCodecDiagnostic(
          'invalid-tiddler-field',
          `Tiddler ${index + 1} must contain only string-valued fields.`,
          source.length,
        ),
      );

      continue;
    }

    const hasTitle =
      typeof candidate.title === 'string' && candidate.title.trim().length > 0;

    if (!hasTitle) {
      diagnostics.push(
        createCodecDiagnostic(
          'missing-tiddler-title',
          `Tiddler ${index + 1} needs a nonempty title.`,
          source.length,
        ),
      );

      continue;
    }

    const title = candidate.title as string;

    if (titles.has(title)) {
      diagnostics.push(
        createCodecDiagnostic(
          'duplicate-tiddler-title',
          `Duplicate tiddler title: ${title}.`,
          source.length,
        ),
      );
    }

    titles.add(title);

    const fields = Object.fromEntries(
      Object.entries(candidate),
    ) as TiddlerFields;

    fields.text = fields.text ?? '';

    tiddlers.push(fields);
  }

  if (diagnostics.length > 0) {
    return { diagnostics };
  }

  return { value: tiddlers, diagnostics };
}
