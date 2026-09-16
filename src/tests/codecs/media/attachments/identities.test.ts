import { exportObsidianNote } from '@/modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '@/modules/conversion-core/notes/importTiddler';
import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { parseTiddlyWikiJson } from '@/modules/conversion-core/codecs/tiddlywiki/parseTiddlyWikiJson';
import { serializeObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';
import { getCodecValue } from '@/tests/support/getCodecValue';

describe('attachment payload and MIME transport', () => {
  it('preserves textual SVG as UTF-8 source rather than treating it as base64', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">\n<title>Été 日本 👨‍👩‍👧</title>\n<text x="0" y="10">**literal** &amp; //literal//</text>\n</svg>\n';

    const original = {
      title: 'Dessin 日本.svg',
      type: 'image/svg+xml',
      text: svg,
    };

    const exported = getCodecValue(
      exportObsidianNote(getCodecValue(importTiddler(original))),
    );

    expect(exported.text).toBe(svg);

    expect(Buffer.from(exported.text, 'utf8')).toEqual(
      Buffer.from(svg, 'utf8'),
    );
  });

  it.each([
    'https://example.com/images/photo%20%C3%A9t%C3%A9.png?size=200#preview',
    '../images/Photo été.png',
    './assets/audio.ogg',
  ])('preserves external resource identity %s', (uri) => {
    const source = JSON.stringify([
      { title: 'External asset', type: 'image/png', _canonical_uri: uri },
    ]);

    const original = getCodecValue(parseTiddlyWikiJson(source))[0];

    const exported = getCodecValue(
      exportObsidianNote(getCodecValue(importTiddler(original))),
    );

    expect(exported._canonical_uri).toBe(uri);
    expect(exported.text).toBe('');
    expect(exported).toEqual(original);
  });

  it('keeps binary payloads intact when metadata changes', () => {
    const binary = Buffer.from([
      0, 255, 0, 128, 92, 10, 13, 240, 159, 152, 128,
    ]);

    const original = {
      title: 'Report.pdf',
      type: 'application/pdf',
      text: binary.toString('base64'),
      caption: 'Before',
    };

    const note = getCodecValue(importTiddler(original));
    const document = getCodecValue(parseObsidianFrontMatter(note.content));

    document.properties.caption = 'After';
    document.properties.review = { approved: true, reviewers: ['Éva', '李'] };

    const editedNote = {
      title: note.title,
      content: serializeObsidianFrontMatter(document.properties, document.body),
    };

    const exported = getCodecValue(exportObsidianNote(editedNote));

    expect(exported.caption).toBe('After');
    expect(Buffer.from(exported.text, 'base64').equals(binary)).toBe(true);

    const returned = getCodecValue(
      parseObsidianFrontMatter(getCodecValue(importTiddler(exported)).content),
    );

    expect(returned.properties.review).toEqual({
      approved: true,
      reviewers: ['Éva', '李'],
    });
  });
});
