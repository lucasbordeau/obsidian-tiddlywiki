import { exportObsidianNote } from '../../../modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '../../../modules/conversion-core/notes/importTiddler';
import { parseObsidianFrontMatter } from '../../../modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '../../../modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';
import { extractPreservationComment } from '../../../modules/conversion-core/preservation/metadata/extractPreservationComment';
import { getCodecValue } from '../../support/getCodecValue';
import { opaqueContentTypes } from './opaqueContentTypes';

describe('metadata-aware, edit-aware interchange', () => {
  it('keeps native Markdown and its own YAML front matter on the native MIME route', () => {
    const original = {
      title: 'Native',
      type: 'text/x-markdown',
      text: '---\naliases: [Native alias]\ntags: [native-tag]\n---\n# **Already Markdown**\n\n`//literal//`\n',
      tags: 'wiki-tag',
    };

    const imported = getCodecValue(importTiddler(original));
    const document = getCodecValue(parseObsidianFrontMatter(imported.content));
    const preservedBody = extractPreservationComment(document.body);

    expect(preservedBody.body).toBe(
      '# **Already Markdown**\n\n`//literal//`\n',
    );

    expect(document.properties['tiddlywiki-import-export']).toBeUndefined();
    expect(document.properties.aliases).toEqual(['Native alias']);

    expect(getCodecValue(exportObsidianNote(imported))).toEqual(original);

    document.properties.aliases = ['Edited alias'];

    const edited = {
      title: imported.title,
      content: serializeObsidianFrontMatter(
        document.properties,
        `${document.body}Added\n`,
      ),
    };

    const exported = getCodecValue(exportObsidianNote(edited));

    expect(exported.type).toBe('text/x-markdown');

    expect(
      getCodecValue(parseObsidianFrontMatter(exported.text)).properties.aliases,
    ).toEqual(['Edited alias']);

    expect(exported.text).toContain('**Already Markdown**');
    expect(exported.text).toContain('Added');
  });

  it.each(opaqueContentTypes)(
    'preserves opaque %s source and emits a diagnostic',
    (type) => {
      const original = {
        title: 'Typed',
        type,
        text: '<b>**literal**</b> // source',
      };

      const result = importTiddler(original);

      expect(
        result.diagnostics.some(
          (diagnostic) => diagnostic.code === 'preserved-content-type',
        ),
      ).toBe(true);

      const document = getCodecValue(
        parseObsidianFrontMatter(getCodecValue(result).content),
      );

      expect(extractPreservationComment(document.body).body).toBe(
        original.text,
      );

      expect(getCodecValue(exportObsidianNote(getCodecValue(result)))).toEqual(
        original,
      );
    },
  );
});
