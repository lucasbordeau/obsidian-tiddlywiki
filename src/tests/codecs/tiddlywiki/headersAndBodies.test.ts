import { parseTidFile } from '../../../modules/conversion-core/codecs/tiddlywiki/parseTidFile';
import { serializeTidFile } from '../../../modules/conversion-core/codecs/tiddlywiki/serializeTidFile';
import { getCodecValue } from '../../support/getCodecValue';

describe('TiddlyWiki containers', () => {
  it.each(['\n', '\r\n', '\r'])(
    'preserves a .tid body with %j line endings',
    (newline) => {
      const body = `  leading text${newline}${newline}trailing${newline}`;
      const source = `title: Example${newline}custom: value: with colon${newline}${newline}${body}`;

      const parsed = parseTidFile(source);

      expect(parsed.value).toEqual({
        title: 'Example',
        custom: 'value: with colon',
        text: body,
      });

      expect(
        parseTidFile(getCodecValue(serializeTidFile(getCodecValue(parsed))))
          .value,
      ).toEqual(parsed.value);
    },
  );

  it('handles inline text without turning the final editor newline into body content', () => {
    expect(parseTidFile('title: Inline\r\ntext: A: B\r\n').value).toEqual({
      title: 'Inline',
      text: 'A: B',
    });
  });

  it.each([
    ['title: A\ntitle: B\n\ntext', 'duplicate-tid-field'],
    ['title A\n\ntext', 'invalid-tid-header'],
    ['title: A\ntext: inline\n\nbody', 'ambiguous-tid-text'],
  ])('reports .tid ambiguity: %s', (source, code) => {
    const parsed = parseTidFile(source);

    expect(parsed.value).toBeUndefined();
    expect(parsed.diagnostics[0].code).toBe(code);
  });

  it('rejects header values whose serialization would remove information', () => {
    expect(
      serializeTidFile({ title: 'A', text: '', custom: 'line\nbreak' }).value,
    ).toBeUndefined();

    expect(
      serializeTidFile({ title: 'A', text: '', custom: ' trailing ' }).value,
    ).toBeUndefined();
  });
});
