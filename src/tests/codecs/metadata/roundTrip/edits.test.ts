import { exportObsidianNote } from '../../../../modules/conversion-core/notes/export/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/import/importTiddler';
import { parseTidFile } from '../../../../modules/conversion-core/codecs/tiddlywiki/tid/parsing/parseTidFile';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/parsing/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/serialization/serializeObsidianFrontMatter';
import { valueOf } from '../../../support/codecs/valueOf';
import { readMetadataSample as fixture } from '../../../support/samples/readMetadataSample';

describe('metadata-aware, edit-aware interchange', () => {
  it('retains edited Markdown body and properties while restoring surviving original tag identities', () => {
    const original = valueOf(parseTidFile(fixture('multilingual.tid')));

    const note = valueOf(importTiddler(original));
    const document = valueOf(parseObsidianFrontMatter(note.content));

    document.properties.tags = ['North_America', 'café_2', 'new-tag'];
    document.properties['custom-field'] = 'changed';
    document.properties.added = { nested: [1, true, 'edited'] };
    delete document.properties.created;

    const edited = {
      title: note.title,
      content: serializeObsidianFrontMatter(
        document.properties,
        '# Changed\n\n**New body**\n',
      ),
    };

    const exported = valueOf(exportObsidianNote(edited));

    expect(exported.tags).toBe('[[North America]] café new-tag');
    expect(exported.created).toBeUndefined();
    expect(exported['custom-field']).toBe('changed');

    expect(exported.text).toContain('Changed');
    expect(exported.text).not.toContain('Heading without');

    const returned = valueOf(
      parseObsidianFrontMatter(valueOf(importTiddler(exported)).content),
    );

    expect(returned.body).toBe('# Changed\n\n**New body**\n');
    expect(returned.properties.added).toEqual({ nested: [1, true, 'edited'] });
  });

  it('preserves TW edits to nested fields and removes deleted properties', () => {
    const original = {
      title: 'A',
      content:
        '---\ntags: [old]\nrating: 4\nnested: {enabled: false}\naliases: [one]\n---\n# Original\n',
    };

    const tiddler = valueOf(exportObsidianNote(original));

    tiddler.rating = '5';
    tiddler.nested = '{"enabled":true,"labels":["updated"]}';
    tiddler.tags = 'new [[A tag]]';
    tiddler.text = '!Changed\n\nEdited';
    delete tiddler.aliases;

    const result = valueOf(importTiddler(tiddler));
    const document = valueOf(parseObsidianFrontMatter(result.content));

    expect(document.properties.rating).toBe(5);

    expect(document.properties.nested).toEqual({
      enabled: true,
      labels: ['updated'],
    });

    expect(document.properties.aliases).toBeUndefined();
    expect(document.properties.tags).toEqual(['new', 'A_tag']);

    expect(document.body).toContain('Changed');
    expect(document.body).not.toContain('Original');

    expect(valueOf(exportObsidianNote(result)).text).toBe(tiddler.text);
  });

  it('does not restore the old document when a preserved note is renamed', () => {
    const original = { title: 'A', text: '!Heading\n\nOld body' };

    const note = valueOf(importTiddler(original));

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
      const exported = valueOf(exportObsidianNote(note));

      exported.text = `!Iteration ${iteration}\n`;

      note = valueOf(importTiddler(exported));

      sizes.push(note.content.length);
    }

    expect(Math.max(...sizes)).toBeLessThan(2000);
    expect(note.content).toContain('Iteration 11');
  });
});
