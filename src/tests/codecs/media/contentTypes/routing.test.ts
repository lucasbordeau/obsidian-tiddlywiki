import { exportObsidianNote } from '../../../../modules/conversion-core/notes/export/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/import/importTiddler';
import { parseObsidianFrontMatter } from '../../../../modules/conversion-core/codecs/obsidian/frontmatter/parsing/parseObsidianFrontMatter';
import { parseTiddlyWikiJson } from '../../../../modules/conversion-core/codecs/tiddlywiki/json/parsing/parseTiddlyWikiJson';
import { TiddlerFields } from '../../../../modules/conversion-core/codecs/tiddlywiki/fields/types/TiddlerFields';
import { valueOf } from '../../../support/codecs/valueOf';
import { wikitextContentTypes } from './cases/wikitextContentTypes';
import { invalidContentTypes } from './cases/invalidContentTypes';

describe('textual and extension content types', () => {
  it.each(['text/x-markdown', 'text/markdown'])(
    'keeps native %s literal regions and Markdown syntax intact',
    (type) => {
      const text =
        '# Already Markdown\r\n\r\n**bold** _italic_ `//code//`\r\n\r\n![image](<Photo été.png>)\r\n';

      const original = { title: 'Native.md', type, text, tags: 'native' };

      const imported = importTiddler(original);

      expect(imported.diagnostics).toEqual([]);

      expect(
        valueOf(parseObsidianFrontMatter(valueOf(imported).content)).body,
      ).toBe(text);

      expect(valueOf(exportObsidianNote(valueOf(imported)))).toEqual(original);
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

      const note = valueOf(importTiddler(original));

      expect(valueOf(parseObsidianFrontMatter(note.content)).body).toContain(
        '# Heading',
      );

      expect(valueOf(exportObsidianNote(note))).toEqual(original);
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
