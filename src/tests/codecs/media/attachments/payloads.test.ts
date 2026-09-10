import { convertTiddlerBody } from '../../../../modules/conversion-core/notes/content/conversion/convertTiddlerBody';
import { exportObsidianNote } from '../../../../modules/conversion-core/notes/export/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/import/importTiddler';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/parsing/parseObsidianFrontMatter';
import { parseTiddlyWikiJson } from '../../../../modules/conversion-core/codecs/tiddlywiki/json/parsing/parseTiddlyWikiJson';
import { parseTidFile } from '../../../../modules/conversion-core/codecs/tiddlywiki/tid/parsing/parseTidFile';
import { serializeTiddlyWikiJson } from '../../../../modules/conversion-core/codecs/tiddlywiki/json/serialization/serializeTiddlyWikiJson';
import { serializeTidFile } from '../../../../modules/conversion-core/codecs/tiddlywiki/tid/serialization/serializeTidFile';
import { TiddlerFields } from '../../../../modules/conversion-core/codecs/tiddlywiki/fields/types/TiddlerFields';
import { readSampleBytes } from '../../../support/samples/readSampleBytes';
import { attachmentCases } from './cases/attachmentCases';
import { valueOf } from '../../../support/codecs/valueOf';

describe('attachment payload and MIME transport', () => {
  it.each(attachmentCases)(
    'preserves every byte and the declared MIME for .$extension ($type)',
    ({ extension, type }) => {
      const binary = Buffer.from(
        Array.from({ length: 1025 }, (_, offset) => offset % 256),
      );

      const original: TiddlerFields = {
        title: `附件/Été résumé (2026).${extension}`,
        type,
        text: binary.toString('base64'),
        created: '20240229213012456',
        modified: '20260909120000001',
        tags: 'media [[Documentation assets]]',
        caption: `Illustration ${extension}`,
      };

      const parsedContainer = valueOf(
        parseTiddlyWikiJson(valueOf(serializeTiddlyWikiJson([original]))),
      );

      const note = valueOf(importTiddler(parsedContainer[0]));

      expect(valueOf(parseObsidianFrontMatter(note.content)).body).toBe(
        original.text,
      );

      const exported = valueOf(exportObsidianNote(note));

      expect(exported).toEqual(original);
      expect(Buffer.from(exported.text, 'base64').equals(binary)).toBe(true);

      const tid = valueOf(serializeTidFile(exported));

      expect(valueOf(parseTidFile(tid))).toEqual(original);
    },
  );

  it('round-trips the existing JPEG fixture through the complete metadata route', () => {
    const binary = readSampleBytes('image.jpg');

    const original = {
      title: 'Photo été.jpg',
      type: 'image/jpeg',
      text: binary.toString('base64'),
    };

    const exported = valueOf(
      exportObsidianNote(valueOf(importTiddler(original))),
    );

    expect(Buffer.from(exported.text, 'base64').equals(binary)).toBe(true);
  });

  it('retains the complete existing MP3 fixture through JSON and opaque body routing', () => {
    const binary = readSampleBytes('test.mp3');

    const original = {
      title: 'Audio voix.mp3',
      type: 'audio/mpeg',
      text: binary.toString('base64'),
    };

    const parsed = valueOf(
      parseTiddlyWikiJson(valueOf(serializeTiddlyWikiJson([original]))),
    )[0];

    const importedBody = convertTiddlerBody(parsed.text, parsed.type, true);

    const exportedBody = convertTiddlerBody(
      importedBody.text,
      parsed.type,
      false,
    );

    expect(Buffer.from(exportedBody.text, 'base64').equals(binary)).toBe(true);
  });
});
