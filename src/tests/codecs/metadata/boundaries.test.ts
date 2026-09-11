import { exportObsidianNote } from '../../../modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '../../../modules/conversion-core/notes/importTiddler';
import { parseTiddlyWikiJson } from '../../../modules/conversion-core/codecs/tiddlywiki/parseTiddlyWikiJson';
import { parseTidFile } from '../../../modules/conversion-core/codecs/tiddlywiki/parseTidFile';
import { serializeTiddlyWikiJson } from '../../../modules/conversion-core/codecs/tiddlywiki/serializeTiddlyWikiJson';
import { serializeTidFile } from '../../../modules/conversion-core/codecs/tiddlywiki/serializeTidFile';
import { PRESERVATION_FIELD } from '../../../modules/conversion-core/preservation/metadata/PreservationField.const';
import { PRESERVATION_PROPERTY } from '../../../modules/conversion-core/preservation/metadata/PreservationProperty.const';
import { TiddlerFields } from '../../../modules/conversion-core/codecs/tiddlywiki/TiddlerFields';
import { getCodecValue } from '../../support/getCodecValue';

describe('field and preservation boundaries', () => {
  it('preserves prototype-like fields without changing JavaScript prototypes', () => {
    const original = getCodecValue(
      parseTiddlyWikiJson(
        '[{"title":"Safe fields","text":"Body","__proto__":"stored value","constructor":"stored constructor"}]',
      ),
    )[0];

    const exported = getCodecValue(
      exportObsidianNote(getCodecValue(importTiddler(original))),
    );

    expect(Object.prototype.hasOwnProperty.call(exported, '__proto__')).toBe(
      true,
    );

    expect(exported.__proto__).toBe('stored value');
    expect(exported.constructor).toBe('stored constructor');
    expect(exported).toEqual(original);
  });

  it('retains documented standard, plugin, ordering and arbitrary Unicode fields', () => {
    const original: TiddlerFields = {
      title: 'Folder/Note 😀 # with spaces',
      text: 'Body',
      type: 'text/plain',
      creator: 'Author',
      modifier: 'Editor',
      list: 'First [[Second title]] First',
      caption: 'A caption',
      class: 'class-one class-two',
      color: '#aabbcc',
      'code-body': 'yes',
      'hide-body': 'no',
      'draft.of': 'Original',
      'draft.title': 'Renamed',
      'list-before': '',
      'list-after': 'Other',
      'plugin-type': 'plugin',
      'plugin-priority': '10',
      'throttle.refresh': '100',
      _is_skinny: 'yes',
      bag: 'public',
      revision: '42',
      UPPER_CASE: 'kept',
      'field with spaces': 'allowed',
      日本語の項目: '値',
      'arbitrary:colon': 'JSON handles this key',
      multiline: 'first\nsecond\n',
      [PRESERVATION_FIELD]: 'user field',
      [PRESERVATION_PROPERTY]: 'another user field',
    };

    const exported = getCodecValue(
      exportObsidianNote(getCodecValue(importTiddler(original))),
    );

    expect(exported).toEqual(original);

    expect(
      getCodecValue(
        parseTiddlyWikiJson(getCodecValue(serializeTiddlyWikiJson([exported]))),
      )[0],
    ).toEqual(original);

    expect(serializeTidFile(original).diagnostics[0].code).toBe(
      'unrepresentable-tid-field',
    );
  });

  it('supports spaced and Unicode .tid field names that fit a header line', () => {
    const original = {
      title: 'Header',
      text: 'Body',
      'Field With Spaces': 'value',
      日本語: 'Été',
    };

    expect(
      getCodecValue(parseTidFile(getCodecValue(serializeTidFile(original)))),
    ).toEqual(original);
  });

  it.each(['', '   '])(
    'rejects an unusable exported note title %j',
    (title) => {
      const result = exportObsidianNote({ title, content: '# A body' });

      expect(result.value).toBeUndefined();
      expect(result.diagnostics[0].code).toBe('missing-tiddler-title');
    },
  );

  it('preserves absent timestamps instead of inventing the current date', () => {
    const exported = getCodecValue(
      exportObsidianNote({ title: 'Undated', content: 'Body' }),
    );

    expect(exported.created).toBeUndefined();
    expect(exported.modified).toBeUndefined();
  });
});
