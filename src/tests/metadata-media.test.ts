import { readFileSync } from 'fs';
import { join } from 'path';
import { CodecResult } from '../modules/conversion-core/codecs/CodecResult';
import { convertTiddlerBody } from '../modules/conversion-core/codecs/convertTiddlerBody';
import { exportObsidianNote } from '../modules/conversion-core/codecs/exportObsidianNote';
import { importTiddler } from '../modules/conversion-core/codecs/importTiddler';
import { parseObsidianFrontMatter } from '../modules/conversion-core/codecs/parseObsidianFrontMatter';
import { parseTiddlyWikiJson } from '../modules/conversion-core/codecs/parseTiddlyWikiJson';
import { parseTidFile } from '../modules/conversion-core/codecs/parseTidFile';
import { serializeObsidianFrontMatter } from '../modules/conversion-core/codecs/serializeObsidianFrontMatter';
import { serializeTiddlyWikiJson } from '../modules/conversion-core/codecs/serializeTiddlyWikiJson';
import { serializeTidFile } from '../modules/conversion-core/codecs/serializeTidFile';
import { PRESERVATION_FIELD } from '../modules/conversion-core/codecs/PreservationField.const';
import { PRESERVATION_PROPERTY } from '../modules/conversion-core/codecs/PreservationProperty.const';
import { TiddlerFields } from '../modules/conversion-core/codecs/TiddlerFields';

// Format inventory: https://obsidian.md/help/file-formats
// MIME/field transport: https://tiddlywiki.com/static/ContentType.html
// External resources: https://tiddlywiki.com/static/ExternalImages.html
// These cases exercise source/byte preservation through the pure codecs.
type AttachmentCase = { extension: string; type: string };

const attachmentCases = JSON.parse(
  readFileSync(
    join(__dirname, 'samples/metadata/attachment-content-types.json'),
    'utf8',
  ),
) as AttachmentCase[];

function valueOf<Value>(result: CodecResult<Value>): Value {
  if (result.value === undefined) {
    throw new Error(JSON.stringify(result.diagnostics));
  }
  return result.value;
}

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
    const binary = readFileSync(join(__dirname, 'samples/image.jpg'));
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
    const binary = readFileSync(join(__dirname, 'samples/test.mp3'));
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

  it('preserves textual SVG as UTF-8 source rather than treating it as base64', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">\n<title>Été 日本 👨‍👩‍👧</title>\n<text x="0" y="10">**literal** &amp; //literal//</text>\n</svg>\n';
    const original = {
      title: 'Dessin 日本.svg',
      type: 'image/svg+xml',
      text: svg,
    };
    const exported = valueOf(
      exportObsidianNote(valueOf(importTiddler(original))),
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
    const original = valueOf(parseTiddlyWikiJson(source))[0];
    const exported = valueOf(
      exportObsidianNote(valueOf(importTiddler(original))),
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
    const note = valueOf(importTiddler(original));
    const document = valueOf(parseObsidianFrontMatter(note.content));
    document.properties.caption = 'After';
    document.properties.review = { approved: true, reviewers: ['Éva', '李'] };
    const editedNote = {
      title: note.title,
      content: serializeObsidianFrontMatter(document.properties, document.body),
    };
    const exported = valueOf(exportObsidianNote(editedNote));
    expect(exported.caption).toBe('After');
    expect(Buffer.from(exported.text, 'base64').equals(binary)).toBe(true);
    const returned = valueOf(
      parseObsidianFrontMatter(valueOf(importTiddler(exported)).content),
    );
    expect(returned.properties.review).toEqual({
      approved: true,
      reviewers: ['Éva', '李'],
    });
  });
});

describe('textual and extension content types', () => {
  it.each([
    {
      title: 'Board.canvas',
      type: 'application/json',
      text: '{"nodes":[{"id":"a","type":"file","file":"Notes/Été.md","x":0,"y":0,"width":400,"height":200}],"edges":[]}',
    },
    {
      title: 'Library.base',
      type: 'text/plain',
      text: 'filters:\n  and:\n    - file.ext == "md"\nviews:\n  - type: table\n    name: Library\n',
    },
  ])(
    'preserves the separate document container $title as typed source',
    (original) => {
      expect(
        valueOf(exportObsidianNote(valueOf(importTiddler(original)))),
      ).toEqual(original);
    },
  );
  const textualCases = [
    { type: 'text/plain', text: '!Title\n**literal** //literal// <tag>\n' },
    {
      type: 'text/html',
      text: '<article title="Été"><b>Bold</b><!--comment--><script>window.x = 1</script></article>',
    },
    {
      type: 'text/css',
      text: '.example::before { content: "**text** //"; }\n/* comment */\n',
    },
    {
      type: 'application/javascript',
      text: 'const pattern = /a\\/b/g;\nconst text = "[[literal]]";\n',
    },
    {
      type: 'application/json',
      text: '{"title":"Not a tiddler container","list":[1,true,null],"literal":"**x**"}',
    },
    {
      type: 'application/x-tiddler-dictionary',
      text: 'key: value: with a colon\nother: [[literal]]\n',
    },
    { type: 'text/csv', text: 'name,note\n"Été","**literal**, //text//"\n' },
    {
      type: 'text/vnd.tiddlywiki-multiple',
      text: '+title: First\n\n!Body\n+title: Second\n\nOther',
    },
    { type: 'text/x-tiddlywiki', text: '{{{Classic literal}}}\n[[A|B]]\n' },
    {
      type: 'application/x-private-format',
      text: '\u0000custom\r\n! raw ** data\u0000',
    },
    {
      type: 'application/json; charset=utf-8',
      text: '{"encoding":"UTF-8","title":"日本"}\n',
    },
  ];

  it.each(textualCases)(
    'preserves opaque $type exactly with a visible diagnostic',
    ({ type, text }) => {
      const original = { title: `Typed/${type}`, type, text };
      const imported = importTiddler(original);
      expect(
        imported.diagnostics.some(
          (diagnostic) => diagnostic.code === 'preserved-content-type',
        ),
      ).toBe(true);
      expect(
        valueOf(parseObsidianFrontMatter(valueOf(imported).content)).body,
      ).toBe(text);
      expect(valueOf(exportObsidianNote(valueOf(imported)))).toEqual(original);
    },
  );

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

  it.each([undefined, '', 'text', 'text/vnd.tiddlywiki'])(
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

  it.each([null, 42, false, ['text/plain'], { type: 'text/plain' }])(
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

describe('field and preservation boundaries', () => {
  it('preserves prototype-like fields without changing JavaScript prototypes', () => {
    const original = valueOf(
      parseTiddlyWikiJson(
        '[{"title":"Safe fields","text":"Body","__proto__":"stored value","constructor":"stored constructor"}]',
      ),
    )[0];
    const exported = valueOf(
      exportObsidianNote(valueOf(importTiddler(original))),
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
    const exported = valueOf(
      exportObsidianNote(valueOf(importTiddler(original))),
    );
    expect(exported).toEqual(original);
    expect(
      valueOf(
        parseTiddlyWikiJson(valueOf(serializeTiddlyWikiJson([exported]))),
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
    expect(valueOf(parseTidFile(valueOf(serializeTidFile(original))))).toEqual(
      original,
    );
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
    const exported = valueOf(
      exportObsidianNote({ title: 'Undated', content: 'Body' }),
    );
    expect(exported.created).toBeUndefined();
    expect(exported.modified).toBeUndefined();
  });

  it('does not restore stale Markdown after a tiddler MIME change', () => {
    const exported = valueOf(
      exportObsidianNote({ title: 'Changed type', content: '**Bold**' }),
    );
    exported.type = 'text/x-markdown';
    const note = valueOf(importTiddler(exported));
    expect(valueOf(parseObsidianFrontMatter(note.content)).body).toBe(
      exported.text,
    );
  });

  it('does not restore stale wikitext after a metadata MIME change', () => {
    const original = {
      title: 'Changed type',
      type: 'text/vnd.tiddlywiki',
      text: "''Bold''",
    };
    const note = valueOf(importTiddler(original));
    const document = valueOf(parseObsidianFrontMatter(note.content));
    document.properties.type = 'text/plain';
    const exported = valueOf(
      exportObsidianNote({
        title: note.title,
        content: serializeObsidianFrontMatter(
          document.properties,
          document.body,
        ),
      }),
    );
    expect(exported.type).toBe('text/plain');
    expect(exported.text).toBe(document.body);
  });

  it('ignores an unknown preservation schema and keeps its value as user metadata', () => {
    const original = {
      title: 'Future schema',
      text: 'Current',
      type: 'text/plain',
      [PRESERVATION_FIELD]: JSON.stringify({
        kind: 'obsidian-tiddlywiki-preservation',
        version: 999,
        sourceBody: 'Stale',
      }),
    };
    const note = valueOf(importTiddler(original));
    expect(valueOf(parseObsidianFrontMatter(note.content)).body).toBe(
      'Current',
    );
    expect(valueOf(exportObsidianNote(note))).toEqual(original);
  });

  it('maps case-only tag edits back to the same original spaced identity', () => {
    const note = valueOf(
      importTiddler({ title: 'Tags', text: 'Body', tags: '[[North America]]' }),
    );
    const document = valueOf(parseObsidianFrontMatter(note.content));
    document.properties.tags = ['north_america'];
    const exported = valueOf(
      exportObsidianNote({
        title: note.title,
        content: serializeObsidianFrontMatter(
          document.properties,
          document.body,
        ),
      }),
    );
    expect(exported.tags).toBe('[[North America]]');
  });
});
