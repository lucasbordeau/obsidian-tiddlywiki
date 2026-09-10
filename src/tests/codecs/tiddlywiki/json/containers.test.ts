import { parseTiddlyWikiJson } from '../../../../modules/conversion-core/codecs/tiddlywiki/json/parsing/parseTiddlyWikiJson';
import { serializeTiddlyWikiJson } from '../../../../modules/conversion-core/codecs/tiddlywiki/json/serialization/serializeTiddlyWikiJson';
import { valueOf } from '../../../support/codecs/valueOf';
import { invalidContainerSources } from './cases/invalidContainerSources';

describe('TiddlyWiki containers', () => {
  it('validates all string fields and supplies an absent optional body', () => {
    const parsed = parseTiddlyWikiJson(
      '[{"title":"A","custom":"a:b"},{"title":"B","text":"","tags":""}]',
    );

    expect(parsed.diagnostics).toEqual([]);

    expect(parsed.value).toEqual([
      { title: 'A', custom: 'a:b', text: '' },
      { title: 'B', text: '', tags: '' },
    ]);

    expect(
      parseTiddlyWikiJson(valueOf(serializeTiddlyWikiJson(valueOf(parsed))))
        .value,
    ).toEqual(parsed.value);
  });

  it.each(invalidContainerSources)(
    'rejects malformed input atomically: %s',
    (source, code) => {
      const result = parseTiddlyWikiJson(source);

      expect(result.value).toBeUndefined();

      expect(
        result.diagnostics.some((diagnostic) => diagnostic.code === code),
      ).toBe(true);
    },
  );

  it('keeps prototype-like names as ordinary fields', () => {
    const parsed = parseTiddlyWikiJson(
      '[{"title":"A","__proto__":"original","constructor":"custom"}]',
    );

    expect(
      Object.prototype.hasOwnProperty.call(valueOf(parsed)[0], '__proto__'),
    ).toBe(true);

    expect(valueOf(parsed)[0].__proto__).toBe('original');
  });
});
