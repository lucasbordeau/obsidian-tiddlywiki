import { exportObsidianNote } from '@/modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '@/modules/conversion-core/notes/importTiddler';
import { parseTidFile } from '@/modules/conversion-core/codecs/tiddlywiki/parseTidFile';
import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';
import { extractPreservationComment } from '@/modules/conversion-core/preservation/metadata/extractPreservationComment';
import { getCodecValue } from '@/testing/support/getCodecValue';
import { readMetadataSample as fixture } from '@/testing/support/samples/readMetadataSample';

describe('metadata-aware, edit-aware interchange', () => {
  it('retains edited Markdown body and properties while restoring surviving original tag identities', () => {
    const original = getCodecValue(parseTidFile(fixture('multilingual.tid')));

    const note = getCodecValue(importTiddler(original));
    const document = getCodecValue(parseObsidianFrontMatter(note.content));
    const preservedBody = extractPreservationComment(document.body);

    document.properties.tags = ['North_America', 'café_2', 'new-tag'];
    document.properties['custom-field'] = 'changed';
    document.properties.added = { nested: [1, true, 'edited'] };
    delete document.properties.created;

    const edited = {
      title: note.title,
      content: serializeObsidianFrontMatter(
        document.properties,
        document.body.replace(
          preservedBody.body,
          '# Changed\n\n**New body**\n',
        ),
      ),
    };

    const exported = getCodecValue(exportObsidianNote(edited));

    expect(exported.tags).toBe('[[North America]] café new-tag');
    expect(exported.created).toBeUndefined();
    expect(exported['custom-field']).toBe('changed');

    expect(exported.text).toContain('Changed');
    expect(exported.text).not.toContain('Heading without');

    const returned = getCodecValue(
      parseObsidianFrontMatter(getCodecValue(importTiddler(exported)).content),
    );

    const returnedBody = extractPreservationComment(returned.body).body;

    expect(returnedBody).toBe('# Changed\n\n**New body**\n');
    expect(returned.properties.added).toEqual({ nested: [1, true, 'edited'] });
  });

  it('preserves TW edits to nested fields and removes deleted properties', () => {
    const original = {
      title: 'A',
      content:
        '---\ntags: [old]\nrating: 4\nnested: {enabled: false}\naliases: [one]\n---\n# Original\n',
    };

    const tiddler = getCodecValue(exportObsidianNote(original));

    tiddler.rating = '5';
    tiddler.nested = '{"enabled":true,"labels":["updated"]}';
    tiddler.tags = 'new [[A tag]]';
    tiddler.text = '!Changed\n\nEdited';
    delete tiddler.aliases;

    const result = getCodecValue(importTiddler(tiddler));
    const document = getCodecValue(parseObsidianFrontMatter(result.content));

    expect(document.properties.rating).toBe(5);

    expect(document.properties.nested).toEqual({
      enabled: true,
      labels: ['updated'],
    });

    expect(document.properties.aliases).toBeUndefined();
    expect(document.properties.tags).toEqual(['new', 'A_tag']);

    expect(document.body).toContain('Changed');
    expect(document.body).not.toContain('Original');

    expect(getCodecValue(exportObsidianNote(result)).text).toBe(tiddler.text);
  });

  it('does not restore the old document when a preserved note is renamed', () => {
    const original = { title: 'A', text: '!Heading\n\nOld body' };

    const note = getCodecValue(importTiddler(original));

    const result = exportObsidianNote({ ...note, title: 'Renamed' });

    expect(result.value?.title).toBe('Renamed');

    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === 'preservation-identity-changed',
      ),
    ).toBe(true);
  });

  it('keeps preservation records bounded during repeated edits and conversions', () => {
    let note = {
      title: 'A',
      content: '---\ncustom: {count: 1}\n---\n# Start\n',
    };

    const sizes: number[] = [];

    for (let iteration = 0; iteration < 12; iteration++) {
      const exported = getCodecValue(exportObsidianNote(note));

      exported.text = `!Iteration ${iteration}\n`;

      note = getCodecValue(importTiddler(exported));

      sizes.push(note.content.length);
    }

    expect(Math.max(...sizes)).toBeLessThan(2000);
    expect(note.content).toContain('Iteration 11');
  });
});
