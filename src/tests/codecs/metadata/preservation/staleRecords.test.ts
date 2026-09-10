import { exportObsidianNote } from '../../../../modules/conversion-core/notes/export/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/import/importTiddler';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/parsing/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/serialization/serializeObsidianFrontMatter';
import { PRESERVATION_FIELD } from '../../../../modules/conversion-core/preservation/metadata/constants/PreservationField.const';
import { valueOf } from '../../../support/codecs/valueOf';

describe('field and preservation boundaries', () => {
  it('does not restore stale Markdown after a tiddler MIME change', () => {
    const exported = valueOf(
      exportObsidianNote({ title: 'Changed type', content: '**Bold**' }),
    );

    exported.type = 'text/x-markdown';

    const note = valueOf(importTiddler(exported));

    expect(valueOf(parseObsidianFrontMatter(note.content)).body).toBe(
      exported.text,
    );
  });

  it('does not restore stale wikitext after a metadata MIME change', () => {
    const original = {
      title: 'Changed type',
      type: 'text/vnd.tiddlywiki',
      text: "''Bold''",
    };

    const note = valueOf(importTiddler(original));
    const document = valueOf(parseObsidianFrontMatter(note.content));

    document.properties.type = 'text/plain';

    const exported = valueOf(
      exportObsidianNote({
        title: note.title,
        content: serializeObsidianFrontMatter(
          document.properties,
          document.body,
        ),
      }),
    );

    expect(exported.type).toBe('text/plain');
    expect(exported.text).toBe(document.body);
  });

  it('ignores an unknown preservation schema and keeps its value as user metadata', () => {
    const original = {
      title: 'Future schema',
      text: 'Current',
      type: 'text/plain',
      [PRESERVATION_FIELD]: JSON.stringify({
        kind: 'obsidian-tiddlywiki-preservation',
        version: 999,
        sourceBody: 'Stale',
      }),
    };

    const note = valueOf(importTiddler(original));

    expect(valueOf(parseObsidianFrontMatter(note.content)).body).toBe(
      'Current',
    );

    expect(valueOf(exportObsidianNote(note))).toEqual(original);
  });

  it('maps case-only tag edits back to the same original spaced identity', () => {
    const note = valueOf(
      importTiddler({ title: 'Tags', text: 'Body', tags: '[[North America]]' }),
    );

    const document = valueOf(parseObsidianFrontMatter(note.content));

    document.properties.tags = ['north_america'];

    const exported = valueOf(
      exportObsidianNote({
        title: note.title,
        content: serializeObsidianFrontMatter(
          document.properties,
          document.body,
        ),
      }),
    );

    expect(exported.tags).toBe('[[North America]]');
  });
});
