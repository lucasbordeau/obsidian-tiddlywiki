import { exportObsidianNote } from '../../../../modules/conversion-core/notes/export/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/import/importTiddler';
import { parseTidFile } from '../../../../modules/conversion-core/codecs/tiddlywiki/tid/parsing/parseTidFile';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/parsing/parseObsidianFrontMatter';
import { PRESERVATION_FIELD } from '../../../../modules/conversion-core/preservation/metadata/constants/PreservationField.const';
import { PRESERVATION_PROPERTY } from '../../../../modules/conversion-core/preservation/metadata/constants/PreservationProperty.const';
import { valueOf } from '../../../support/codecs/valueOf';
import { readMetadataSample as fixture } from '../../../support/samples/readMetadataSample';

describe('metadata-aware, edit-aware interchange', () => {
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
});
