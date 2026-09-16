import { exportObsidianNote } from '@/modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '@/modules/conversion-core/notes/importTiddler';
import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';
import { extractPreservationComment } from '@/modules/conversion-core/preservation/metadata/extractPreservationComment';
import { PRESERVATION_FIELD } from '@/modules/conversion-core/preservation/metadata/PreservationField.const';
import { getCodecValue } from '@/testing/support/getCodecValue';

describe('field and preservation boundaries', () => {
  it('does not restore stale Markdown after a tiddler MIME change', () => {
    const exported = getCodecValue(
      exportObsidianNote({ title: 'Changed type', content: '**Bold**' }),
    );

    exported.type = 'text/x-markdown';

    const note = getCodecValue(importTiddler(exported));

    const document = getCodecValue(parseObsidianFrontMatter(note.content));

    expect(extractPreservationComment(document.body).body).toBe(exported.text);
  });

  it('does not restore stale wikitext after a metadata MIME change', () => {
    const original = {
      title: 'Changed type',
      type: 'text/vnd.tiddlywiki',
      text: "''Bold''",
    };

    const note = getCodecValue(importTiddler(original));
    const document = getCodecValue(parseObsidianFrontMatter(note.content));
    const preservedBody = extractPreservationComment(document.body);

    document.properties.type = 'text/plain';

    const exported = getCodecValue(
      exportObsidianNote({
        title: note.title,
        content: serializeObsidianFrontMatter(
          document.properties,
          document.body,
        ),
      }),
    );

    expect(exported.type).toBe('text/plain');
    expect(exported.text).toBe(preservedBody.body);
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

    const note = getCodecValue(importTiddler(original));

    const document = getCodecValue(parseObsidianFrontMatter(note.content));

    expect(extractPreservationComment(document.body).body).toBe('Current');

    expect(getCodecValue(exportObsidianNote(note))).toEqual(original);
  });

  it('maps case-only tag edits back to the same original spaced identity', () => {
    const note = getCodecValue(
      importTiddler({ title: 'Tags', text: 'Body', tags: '[[North America]]' }),
    );

    const document = getCodecValue(parseObsidianFrontMatter(note.content));

    document.properties.tags = ['north_america'];

    const exported = getCodecValue(
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
