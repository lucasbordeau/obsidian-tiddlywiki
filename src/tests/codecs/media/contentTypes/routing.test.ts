import { exportObsidianNote } from '../../../../modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/importTiddler';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { extractPreservationComment } from '../../../../modules/conversion-core/preservation/metadata/extractPreservationComment';
import { parseTiddlyWikiJson } from '../../../../modules/conversion-core/codecs/tiddlywiki/parseTiddlyWikiJson';
import { TiddlerFields } from '../../../../modules/conversion-core/codecs/tiddlywiki/TiddlerFields';
import { getCodecValue } from '../../../support/getCodecValue';
import { wikitextContentTypes } from './wikitextContentTypes';
import { invalidContentTypes } from './invalidContentTypes';

describe('textual and extension content types', () => {
  it.each(['text/x-markdown', 'text/markdown'])(
    'keeps native %s literal regions and Markdown syntax intact',
    (type) => {
      const text =
        '# Already Markdown\r\n\r\n**bold** _italic_ `//code//`\r\n\r\n![image](<Photo été.png>)\r\n';

      const original = { title: 'Native.md', type, text, tags: 'native' };

      const imported = importTiddler(original);

      expect(imported.diagnostics).toEqual([]);

      const document = getCodecValue(
        parseObsidianFrontMatter(getCodecValue(imported).content),
      );

      expect(extractPreservationComment(document.body).body).toBe(text);

      expect(
        getCodecValue(exportObsidianNote(getCodecValue(imported))),
      ).toEqual(original);
    },
  );

  it.each(wikitextContentTypes)(
    'routes the legacy/default wikitext declaration %j structurally',
    (type) => {
      const original: TiddlerFields = {
        title: 'Wikitext',
        text: '!Heading\n\n* Parent\n** Child',
      };

      if (type !== undefined) {
        original.type = type;
      }

      const note = getCodecValue(importTiddler(original));

      expect(
        getCodecValue(parseObsidianFrontMatter(note.content)).body,
      ).toContain('# Heading');

      expect(getCodecValue(exportObsidianNote(note))).toEqual(original);
    },
  );

  it.each(invalidContentTypes)(
    'rejects nonstring MIME declarations: %j',
    (type) => {
      const result = parseTiddlyWikiJson(
        JSON.stringify([{ title: 'Invalid', text: 'body', type }]),
      );

      expect(result.value).toBeUndefined();
      expect(result.diagnostics[0].code).toBe('invalid-tiddler-field');
    },
  );
});
