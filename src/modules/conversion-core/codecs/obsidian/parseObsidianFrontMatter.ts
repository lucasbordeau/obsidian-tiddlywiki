import { parseDocument } from 'yaml';
import { CodecResult } from '@/modules/conversion-core/codecs/CodecResult';
import { createCodecDiagnostic } from '@/modules/conversion-core/codecs/createCodecDiagnostic';
import { FrontMatterDocument } from '@/modules/conversion-core/codecs/obsidian/FrontMatterDocument';
import { isRecord } from '@/modules/conversion-core/validation/isRecord';

export function parseObsidianFrontMatter(
  source: string,
): CodecResult<FrontMatterDocument> {
  const opening = /^(?:\uFEFF)?---[ \t]*(?:\r\n|\n|\r)/.exec(source);

  if (!opening) {
    return {
      value: { properties: {}, body: source, rawFrontMatter: '' },
      diagnostics: [],
    };
  }

  const rest = source.slice(opening[0].length);
  const closing = /^---[ \t]*(?:\r\n|\n|\r|$)/m.exec(rest);

  if (!closing) {
    return {
      diagnostics: [
        createCodecDiagnostic(
          'unclosed-frontmatter',
          'The YAML front matter has no closing delimiter.',
          source.length,
        ),
      ],
    };
  }

  const end = opening[0].length + closing.index + closing[0].length;
  const yamlSource = rest.slice(0, closing.index);

  try {
    const document = parseDocument(yamlSource, {
      uniqueKeys: true,
      schema: 'core',
    });

    const diagnostics = document.errors.map((error) =>
      createCodecDiagnostic('invalid-frontmatter', error.message, end),
    );

    const warnings = document.warnings.map((warning) =>
      createCodecDiagnostic(
        'frontmatter-warning',
        warning.message,
        end,
        'warning',
      ),
    );

    diagnostics.push(...warnings);

    if (document.errors.length > 0) {
      return { diagnostics };
    }

    const decoded: unknown = document.toJS({ maxAliasCount: 50 });
    const properties = decoded === null ? {} : decoded;

    if (!isRecord(properties)) {
      return {
        diagnostics: [
          createCodecDiagnostic(
            'invalid-frontmatter-shape',
            'YAML front matter must be a property mapping.',
            end,
          ),
        ],
      };
    }

    JSON.stringify(properties);

    return {
      value: {
        properties,
        body: source.slice(end),
        rawFrontMatter: source.slice(0, end),
      },
      diagnostics,
    };
  } catch {
    return {
      diagnostics: [
        createCodecDiagnostic(
          'invalid-frontmatter',
          'YAML front matter contains invalid or cyclic values, or excessive aliases.',
          end,
        ),
      ],
    };
  }
}
