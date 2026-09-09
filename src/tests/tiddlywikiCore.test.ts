import { readFileSync } from 'fs';
import { join } from 'path';
import { parseTiddlyWiki } from '../modules/conversion-core/tiddlywiki/parseTiddlyWiki';
import { serializeTiddlyWiki } from '../modules/conversion-core/tiddlywiki/serializeTiddlyWiki';
import { parseObsidian } from '../modules/conversion-core/markdown/parseObsidian';
import { convertText } from '../modules/conversion-core/convertText';
import { BlockNode } from '../modules/conversion-core/types/BlockNode';
import { InlineNode } from '../modules/conversion-core/types/InlineNode';
import { ParsedDocument } from '../modules/conversion-core/types/ParsedDocument';
import { encodePreservedSource } from '../modules/conversion-core/preservation/encodePreservedSource';
import { semanticBlocks } from './utils/semanticBlocks';
import { renderTiddlyWiki } from './utils/renderTiddlyWiki';

const stressSource = readFileSync(
  join(__dirname, 'samples/conversion-core/tiddlywiki-stress.tid'),
  'utf8',
);

function documentFromBlocks(blocks: BlockNode[]): ParsedDocument {
  return {
    dialect: 'obsidian',
    source: '',
    blocks,
    diagnostics: [],
    tokens: [],
  };
}

function paragraph(children: InlineNode[]): BlockNode {
  return { type: 'paragraph', children };
}

function allNodeTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(allNodeTypes);
  }
  if (value === null || typeof value !== 'object') {
    return [];
  }
  const record = value as Record<string, unknown>;
  const ownTypes = typeof record.type === 'string' ? [record.type] : [];
  return [...ownTypes, ...Object.values(record).flatMap(allNodeTypes)];
}

describe('TiddlyWiki structural parsing and serialization', () => {
  test('compound fixture retains native semantics and actual TW rendering across repeated serialization', async () => {
    const original = parseTiddlyWiki(stressSource);
    expect(original.diagnostics).toEqual([]);
    expect(allNodeTypes(original.blocks)).not.toContain('raw');
    let serialized = stressSource;
    for (let cycle = 0; cycle < 5; cycle++) {
      serialized = serializeTiddlyWiki(parseTiddlyWiki(serialized)).text;
      expect(semanticBlocks(parseTiddlyWiki(serialized).blocks)).toEqual(
        semanticBlocks(original.blocks),
      );
    }
    expect(await renderTiddlyWiki(serialized)).toBe(
      await renderTiddlyWiki(stressSource.trimEnd()),
    );
  });

  test.each([
    '!No space\n!! Two\n!!!!!! Six',
    "''outer //inner __under__//'' and ~~deleted~~ ^^upper^^ ,,lower,,",
    '[[label|Folder/Exact:Title_é]] [ext[relative|../file.html]] [ext[URL|https://example.org/a_(b)?x=1&y=2]]',
    "|!First|!Second|\n|[[literal ''label''|A]]|`code|pipe`|",
    "```text\n[[not a link]]\n''literal''\n!not a heading\n* not list\n```",
    '> first\n>> nested\n> final',
    '* one\n*# two\n*#* three\n*#*# four\n*#* five\n* six\n# seven',
  ])(
    'matches the pinned TW renderer for supported source: %s',
    async (source) => {
      const result = serializeTiddlyWiki(parseTiddlyWiki(source));
      expect(await renderTiddlyWiki(result.text)).toBe(
        await renderTiddlyWiki(source),
      );
    },
  );

  test('global regex regressions stay protected inside links, code and fenced code', () => {
    const source =
      "`''code'' __literal__`\n\n[[literal ''label''|Folder/Case_Sensitive:é]]\n\n```\n!title\n* item\n[[raw]]\n```";
    const document = parseTiddlyWiki(source);
    expect(document.blocks[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'code', value: "''code'' __literal__" }],
    });
    expect(document.blocks[1]).toMatchObject({
      children: [
        {
          type: 'link',
          target: 'Folder/Case_Sensitive:é',
          label: [{ type: 'text', value: "literal ''label''" }],
        },
      ],
    });
    expect(document.blocks[2]).toMatchObject({
      type: 'code',
      value: '!title\n* item\n[[raw]]',
    });
  });

  test('a heading-looking line inside an existing paragraph follows TW block boundaries', async () => {
    const source = 'Paragraph\n!This is inline text\n\n!This is a heading';
    const document = parseTiddlyWiki(source);
    expect(document.blocks.map((block) => block.type)).toEqual([
      'paragraph',
      'heading',
    ]);
    expect(await renderTiddlyWiki(serializeTiddlyWiki(document).text)).toBe(
      await renderTiddlyWiki(source),
    );
  });

  test('lexical coverage and UTF-16 source spans remain exact on CRLF and astral Unicode', () => {
    const source = '!🙂é\r\n\r\n* one\r\n*# [[Unicode|路径/💡]]\r\n';
    const document = parseTiddlyWiki(source);
    expect(document.tokens.map((token) => token.raw).join('')).toBe(source);
    let offset = 0;
    for (const token of document.tokens) {
      expect(token.range.start).toBe(offset);
      expect(source.slice(token.range.start, token.range.end)).toBe(token.raw);
      offset = token.range.end;
    }
    expect(offset).toBe(source.length);
    expect(document.blocks[0]).toMatchObject({
      range: { start: 0, end: 4 },
      children: [{ range: { start: 1, end: 4 } }],
    });
  });

  test.each([
    '<$list filter="[tag[Test]]"><$text text="[[literal]]"/><$list filter="[all[]]">nested</$list></$list>',
    '<<macro first:"a >> b" second:\'c >> d\'>>',
    '{{{ [tag[Test]sort[title]] ||Template}}}',
    '{{Some tiddler!!field}}',
    '@@.custom color:red;[[text|link]]@@',
    '|caption|c\n|!header|\n|body|',
  ])(
    'retains unsupported source through an intermediate edit: %s',
    (unsupported) => {
      const source = '!Old title\n\n' + unsupported;
      const incoming = convertText(source, 'tiddlywiki', 'obsidian');
      expect(incoming.diagnostics.length).toBeGreaterThan(0);
      const outgoing = convertText(
        incoming.text.replace('Old title', 'New title'),
        'obsidian',
        'tiddlywiki',
      );
      expect(outgoing.text).toContain(unsupported);
      expect(outgoing.text).toContain('New title');
    },
  );

  test.each([
    '[[unfinished',
    '<<unfinished "argument >>',
    '```\n[[literal]]',
    '<$list filter="[tag[A]]">unfinished',
    "''unfinished //format",
  ])('unfinished editor input stays covered and diagnosed: %s', (source) => {
    const document = parseTiddlyWiki(source);
    expect(document.tokens.map((token) => token.raw).join('')).toBe(source);
    expect(document.diagnostics.length).toBeGreaterThan(0);
  });

  test('capsules are recognized as inline and block recoverable regions', () => {
    const preserved = {
      dialect: 'obsidian' as const,
      value: '$x_1$',
      reason: 'math',
    };
    const capsule = encodePreservedSource(preserved);
    const inline = parseTiddlyWiki('Before ' + capsule + ' after');
    expect(inline.blocks[0]).toMatchObject({
      children: [
        { type: 'text' },
        { type: 'raw', ...preserved },
        { type: 'text' },
      ],
    });
    expect(parseTiddlyWiki(capsule).blocks[0]).toMatchObject({
      type: 'raw',
      ...preserved,
    });
  });

  test('literal text cannot accidentally introduce TW formatting, widgets, autolinks or list markers', async () => {
    const literal =
      "#tag **stars** ''quotes''' //// __under___ ~~tilde~~ @@style@@ ,,sub,, ^^sup^^ [[link]] {{embed}} <script>alert('x')</script> `code` HelloThere\n* item\n!heading";
    const result = serializeTiddlyWiki(
      documentFromBlocks([paragraph([{ type: 'text', value: literal }])]),
    );
    const html = await renderTiddlyWiki(result.text);
    expect(html).not.toMatch(/<(?:strong|em|u|s|sub|sup|script|ul|h1|a)\b/);
    expect(html).toContain("''quotes'''");
    expect(html).toContain('[[link]] {{embed}} &lt;script&gt;');
    expect(semanticBlocks(parseTiddlyWiki(result.text).blocks)).toEqual(
      semanticBlocks(
        documentFromBlocks([paragraph([{ type: 'text', value: literal }])])
          .blocks,
      ),
    );
  });

  test('complex continuation/task/start-number lists survive the static HTML representation', async () => {
    const source =
      '7. **first**\n\n   continuation with [URL](https://example.org/?a=1&b=2)\n\n   - [x] checked\n   - [ ] unchecked\n\n8. second';
    const original = parseObsidian(source);
    const serialized = serializeTiddlyWiki(original);
    expect(serialized.text).toContain('<ol start="7">');
    expect(serialized.text).not.toContain('<!--otw');
    expect(semanticBlocks(parseTiddlyWiki(serialized.text).blocks)).toEqual(
      semanticBlocks(original.blocks),
    );
    const html = await renderTiddlyWiki(serialized.text);
    expect(html).toContain('<ol start="7">');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked');
    expect(html).toContain('href="https://example.org/?a=1&amp;b=2"');
  });

  test('code containing TW fences and both quote types stays literal and editable', async () => {
    const literal =
      "```\n'''' //// [[literal]] <strong>html</strong>\nconst x = \"'both'\";";
    const document = documentFromBlocks([
      { type: 'code', value: literal, language: 'c++' },
    ]);
    const serialized = serializeTiddlyWiki(document);
    expect(serialized.text).toContain('<pre><code');
    expect(serialized.text).not.toContain('<!--otw');
    expect(semanticBlocks(parseTiddlyWiki(serialized.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );
    const html = await renderTiddlyWiki(serialized.text);
    expect(html).not.toContain('<strong>');
    expect(html).toContain('[[literal]] &lt;strong&gt;html&lt;/strong&gt;');
  });

  test('rich labels and URL/title attributes preserve literal ampersands and quote delimiters', async () => {
    const link: InlineNode = {
      type: 'link',
      external: true,
      target: 'https://example.org/?a=1&b="two"',
      title: 'a "double" and \'single\' title',
      label: [
        {
          type: 'strong',
          children: [{ type: 'text', value: 'bold & literal' }],
        },
      ],
    };
    const document = documentFromBlocks([paragraph([link])]);
    const serialized = serializeTiddlyWiki(document);
    const html = await renderTiddlyWiki(serialized.text);
    expect(html).toContain(
      'href="https://example.org/?a=1&amp;b=&quot;two&quot;"',
    );
    expect(html).not.toContain('&amp;amp;');
    expect(semanticBlocks(parseTiddlyWiki(serialized.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );
  });

  test('callouts and footnotes use visible static structures and recover their semantic nodes', async () => {
    const source =
      '> [!warning]- **Rich** _title_\n> Body with ==highlight==.\n\nFootnote[^é id].\n\n[^é id]: Definition **body**.';
    const original = parseObsidian(source);
    const serialized = serializeTiddlyWiki(original);
    expect(serialized.text).toContain('<aside');
    expect(serialized.text).toContain('<mark>');
    expect(semanticBlocks(parseTiddlyWiki(serialized.text).blocks)).toEqual(
      semanticBlocks(original.blocks),
    );
    const html = await renderTiddlyWiki(serialized.text);
    expect(html).toContain('<aside');
    expect(html).toContain('<mark>highlight</mark>');
  });

  test('the official empty-code-fence edge case is retained', async () => {
    const source = '```\n```';
    expect(parseTiddlyWiki(source).blocks[0]).toMatchObject({
      type: 'code',
      value: '```',
    });
    const serialized = serializeTiddlyWiki(parseTiddlyWiki(source)).text;
    expect(await renderTiddlyWiki(serialized)).toContain('```');
    expect(await renderTiddlyWiki(source)).toContain('```');
  });
});
