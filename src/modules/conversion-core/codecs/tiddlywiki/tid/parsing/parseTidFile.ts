import type { CodecResult } from '../../../results/CodecResult';
import { createCodecDiagnostic } from '../../../diagnostics/createCodecDiagnostic';
import { parseTiddlyWikiJson } from '../../json/parsing/parseTiddlyWikiJson';
import type { TiddlerFields } from '../../fields/types/TiddlerFields';

export function parseTidFile(source: string): CodecResult<TiddlerFields> {
  const normalizedSource = source.replace(/^\uFEFF/, '');

  const separator = /(?:\r\n|\n|\r(?!\n))[ \t]*(?:\r\n|\n|\r(?!\n))/.exec(
    normalizedSource,
  );

  const header = separator
    ? normalizedSource.slice(0, separator.index)
    : normalizedSource;

  const headerLines = header.split(/\r\n|\n|\r/);

  const fields: Record<string, string> = Object.create(null);
  const diagnostics = [];

  for (const headerLine of headerLines) {
    if (headerLine.trim() === '') {
      continue;
    }

    const colonIndex = headerLine.indexOf(':');
    const name = headerLine.slice(0, colonIndex).trim();
    const isValidField = colonIndex > 0 && name.length > 0;

    if (!isValidField) {
      diagnostics.push(
        createCodecDiagnostic(
          'invalid-tid-header',
          `Invalid tiddler header: ${headerLine}.`,
          source.length,
        ),
      );

      continue;
    }

    if (Object.prototype.hasOwnProperty.call(fields, name)) {
      diagnostics.push(
        createCodecDiagnostic(
          'duplicate-tid-field',
          `Duplicate tiddler field: ${name}.`,
          source.length,
        ),
      );

      continue;
    }

    fields[name] = headerLine.slice(colonIndex + 1).trim();
  }

  if (separator) {
    const hasInlineText = Object.prototype.hasOwnProperty.call(fields, 'text');

    if (hasInlineText) {
      diagnostics.push(
        createCodecDiagnostic(
          'ambiguous-tid-text',
          'The tiddler has both an inline text field and a body.',
          source.length,
        ),
      );
    }

    fields.text = normalizedSource.slice(separator.index + separator[0].length);
  }

  if (diagnostics.length > 0) {
    return { diagnostics };
  }

  const validation = parseTiddlyWikiJson(JSON.stringify([fields]));

  return { value: validation.value?.[0], diagnostics: validation.diagnostics };
}
