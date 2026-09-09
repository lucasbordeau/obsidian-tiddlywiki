import { readFileSync } from 'fs';
import { join } from 'path';
import { exportObsidianNote } from '../modules/conversion-core/codecs/exportObsidianNote';
import { importTiddler } from '../modules/conversion-core/codecs/importTiddler';
import { parseTidFile } from '../modules/conversion-core/codecs/parseTidFile';
import { parseObsidianFrontMatter } from '../modules/conversion-core/codecs/parseObsidianFrontMatter';
import { serializeObsidianFrontMatter } from '../modules/conversion-core/codecs/serializeObsidianFrontMatter';
import { extractTagsFromObsidianNote } from '../modules/obsidian/utils/splitTagsAndTextFromObsidianNote';
import { CodecResult } from '../modules/conversion-core/codecs/CodecResult';
import { PRESERVATION_FIELD } from '../modules/conversion-core/codecs/PreservationField.const';
import { PRESERVATION_PROPERTY } from '../modules/conversion-core/codecs/PreservationProperty.const';

function valueOf<Value>(result: CodecResult<Value>): Value {
  if (result.value === undefined) {
    throw new Error(JSON.stringify(result.diagnostics));
  }
  return result.value;
}

const fixture = (name: string): string =>
  readFileSync(join(__dirname, 'samples', 'metadata', name), 'utf8');

describe('metadata-aware, edit-aware interchange', () => {
  it('keeps underscore tag names inside emphasis and skips hashes in inline literal HTML', () => {
    const note = {
      title: 'Formatted tags',
      content:
        '_#italic_tag_ **#bold_tag** #normal_tag and <code>#code</code> <script>#script</script>\n',
    };
    expect(extractTagsFromObsidianNote(note)).toEqual([
      'italic_tag',
      'bold_tag',
      'normal_tag',
    ]);
  });
  it('distinguishes escaped hashes, punctuation boundaries, Unicode numbers and joined emoji tags', () => {
    const note = {
      title: 'Tags',
      content:
        '\\#escaped (#parenthesized) #👨‍👩‍👧 #١٢٣ #日本\n\n&#35;entity-tag\n',
    };
    expect(extractTagsFromObsidianNote(note)).toEqual([
      'parenthesized',
      '👨‍👩‍👧',
      '日本',
    ]);
  });
  it('restores complex Markdown exactly, including YAML spelling and collided namespace fields', () => {
    const note = {
      title: 'folder/A note',
      content: fixture('complex-frontmatter.md'),
    };
    const tiddler = valueOf(exportObsidianNote(note));
    expect(tiddler.type).toBe('text/vnd.tiddlywiki');
    expect(tiddler.created).toBe('20240229000000000');
    expect(tiddler.modified).toBe('20240229213012456');
    expect(tiddler[PRESERVATION_FIELD]).toBe('User-owned field');
    expect(tiddler[`${PRESERVATION_FIELD}-1`]).toContain(
      'obsidian-tiddlywiki-preservation',
    );
    expect(valueOf(importTiddler(tiddler))).toEqual(note);
  });

  it('restores a complete TW field set and exact wikitext, including tag collisions and widgets', () => {
    const tiddler = valueOf(parseTidFile(fixture('multilingual.tid')));
    const note = valueOf(importTiddler(tiddler));
    const document = valueOf(parseObsidianFrontMatter(note.content));
    expect(document.properties.tags).toEqual([
      'North_America',
      'North_America_2',
      'CAFÉ',
      'café_2',
      'world/été',
      '数字_123',
      'tag_123',
    ]);
    expect(document.properties[PRESERVATION_PROPERTY]).toBe(
      'A user-owned field',
    );
    expect(valueOf(exportObsidianNote(note))).toEqual(tiddler);
  });

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

  it('keeps native Markdown and its own YAML front matter on the native MIME route', () => {
    const original = {
      title: 'Native',
      type: 'text/x-markdown',
      text: '---\naliases: [Native alias]\ntags: [native-tag]\n---\n# **Already Markdown**\n\n`//literal//`\n',
      tags: 'wiki-tag',
    };
    const imported = valueOf(importTiddler(original));
    const document = valueOf(parseObsidianFrontMatter(imported.content));
    expect(document.body).toBe('# **Already Markdown**\n\n`//literal//`\n');
    expect(document.properties.aliases).toEqual(['Native alias']);
    expect(valueOf(exportObsidianNote(imported))).toEqual(original);
    document.properties.aliases = ['Edited alias'];
    const edited = {
      title: imported.title,
      content: serializeObsidianFrontMatter(
        document.properties,
        `${document.body}Added\n`,
      ),
    };
    const exported = valueOf(exportObsidianNote(edited));
    expect(exported.type).toBe('text/x-markdown');
    expect(
      valueOf(parseObsidianFrontMatter(exported.text)).properties.aliases,
    ).toEqual(['Edited alias']);
    expect(exported.text).toContain('**Already Markdown**');
    expect(exported.text).toContain('Added');
  });

  it.each([
    'application/json',
    'text/html',
    'text/plain',
    'application/javascript',
    'image/svg+xml',
  ])('preserves opaque %s source and emits a diagnostic', (type) => {
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
    expect(
      valueOf(parseObsidianFrontMatter(valueOf(result).content)).body,
    ).toBe(original.text);
    expect(valueOf(exportObsidianNote(valueOf(result)))).toEqual(original);
  });

  it('extracts property and real body tags while ignoring literals and link destinations', () => {
    const note = {
      title: 'Tags',
      content:
        '---\ntags: [property-tag]\n---\n# Heading\n\n#body-tag and **#bold-tag** `#code-tag` [#label-tag](https://example.com/#url-tag)\n\n```md\n#fenced-tag\n```\n\n- #list-tag\n',
    };
    expect(extractTagsFromObsidianNote(note)).toEqual([
      'property-tag',
      'body-tag',
      'bold-tag',
      'list-tag',
    ]);
  });
});
