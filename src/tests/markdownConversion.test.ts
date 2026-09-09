import fs from 'fs';
import path from 'path';
import { parseObsidian } from '../modules/conversion-core/markdown/parseObsidian';
import { serializeObsidian } from '../modules/conversion-core/markdown/serializeObsidian';
import { encodePreservedSource } from '../modules/conversion-core/preservation/encodePreservedSource';
import { BlockNode } from '../modules/conversion-core/types/BlockNode';
import { ParsedDocument } from '../modules/conversion-core/types/ParsedDocument';
import { InlineNode } from '../modules/conversion-core/types/InlineNode';
import { convertText } from '../modules/conversion-core/convertText';
import { semanticBlocks as normalizedSemanticBlocks } from './utils/semanticBlocks';

function blocksOf(source: string): BlockNode[] {
  return JSON.parse(
    JSON.stringify(parseObsidian(source).blocks, (key, value: unknown) =>
      key === 'range' ? undefined : value,
    ),
  ) as BlockNode[];
}

function fixture(name: string): string {
  return fs.readFileSync(
    path.join(__dirname, 'samples/conversion-core/markdown', name),
    'utf8',
  );
}

function semanticBlocks(blocks: BlockNode[]): unknown {
  return JSON.parse(
    JSON.stringify(blocks, (key, value: unknown) =>
      key === 'range' ? undefined : value,
    ),
  );
}

describe('Obsidian structural parsing', () => {
  test('preserves nested formatting, code literals, alias identity and protected delimiters', () => {
    const blocks = blocksOf(
      '**outer _inner_ and `**literal** [[not link]]`** ==a **highlight**== [[Folder/Note#Heading|a **literal** label]]',
    );
    expect(blocks).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'strong',
            children: [
              { type: 'text', value: 'outer ' },
              {
                type: 'emphasis',
                children: [{ type: 'text', value: 'inner' }],
              },
              { type: 'text', value: ' and ' },
              { type: 'code', value: '**literal** [[not link]]' },
            ],
          },
          { type: 'text', value: ' ' },
          {
            type: 'highlight',
            children: [
              { type: 'text', value: 'a ' },
              {
                type: 'strong',
                children: [{ type: 'text', value: 'highlight' }],
              },
            ],
          },
          { type: 'text', value: ' ' },
          {
            type: 'link',
            target: 'Folder/Note#Heading',
            label: [{ type: 'text', value: 'a **literal** label' }],
            external: false,
          },
        ],
      },
    ]);
  });

  test('parses CommonMark mixed lists, non-one starts, tasks and loose item blocks', () => {
    const blocks = blocksOf(
      '7. first\n   - [x] done\n     1. nested\n   - [ ] pending\n8. second\n\n   second paragraph\n\n   ```js\n   **literal**\n   ```',
    );
    expect(blocks[0]).toMatchObject({ type: 'list', ordered: true, start: 7 });
    const outer = blocks[0];
    if (outer.type !== 'list') {
      throw new Error('Expected an ordered list');
    }
    expect(outer.children).toHaveLength(2);
    expect(outer.children[0].blocks[1]).toMatchObject({
      type: 'list',
      ordered: false,
      children: [{ checked: true }, { checked: false }],
    });
    expect(outer.children[1].blocks).toMatchObject([
      { type: 'paragraph' },
      { type: 'paragraph' },
      { type: 'code', value: '**literal**', language: 'js' },
    ]);
  });

  test('parses tables with alignment, escaped pipes, code and wikilinks', () => {
    const blocks = blocksOf(
      '| Left | Center | Right |\n| :--- | :---: | ---: |\n| `a\\|b` | [[Folder/Note\\|label]] | **strong** |',
    );
    expect(blocks).toMatchObject([
      {
        type: 'table',
        alignments: ['left', 'center', 'right'],
        rows: [
          [
            [{ type: 'code', value: 'a|b' }],
            [
              {
                type: 'link',
                target: 'Folder/Note',
                label: [{ type: 'text', value: 'label' }],
              },
            ],
            expect.arrayContaining([
              expect.objectContaining({ type: 'strong' }),
            ]),
          ],
        ],
      },
    ]);
  });

  test('handles image dimensions, markdown titles and formatted link labels separately', () => {
    const blocks = blocksOf(
      '![[media/a picture.png|320x200]] ![[Other#^block]] ![a label](image.png "Image title") [a **strong** label](https://example.org/a_(b)?q=x_y "Link title")',
    );
    expect(blocks[0]).toMatchObject({
      children: expect.arrayContaining([
        {
          type: 'embed',
          target: 'media/a picture.png',
          kind: 'image',
          alt: '',
          width: '320',
          height: '200',
        },
        { type: 'embed', target: 'Other#^block', kind: 'note', alt: '' },
        {
          type: 'embed',
          target: 'image.png',
          kind: 'image',
          alt: 'a label',
          title: 'Image title',
        },
        expect.objectContaining({
          type: 'link',
          target: 'https://example.org/a_(b)?q=x_y',
          external: true,
          title: 'Link title',
          label: expect.arrayContaining([
            { type: 'strong', children: [{ type: 'text', value: 'strong' }] },
          ]),
        }),
      ]),
    });
  });

  test('protects four-plus and tilde fences, indented code and shorter interior delimiters', () => {
    const source =
      '`````markdown extra\n```\n**unchanged** [[not a link]] ==not a highlight==\n```\n`````\n\n~~~~ts\n$not math$\n~~~~\n\n    [[indented literal]]\n';
    const blocks = blocksOf(source);
    expect(blocks).toEqual([
      {
        type: 'code',
        language: 'markdown extra',
        value: '```\n**unchanged** [[not a link]] ==not a highlight==\n```',
      },
      { type: 'code', language: 'ts', value: '$not math$' },
      { type: 'code', language: '', value: '[[indented literal]]' },
    ]);
  });

  test('parses nested callouts and footnotes without consuming following blocks', () => {
    const source =
      '> [!warning]- Title\n> Body $x_1$ and [^note].\n>\n> > [!tip] Nested\n> > Content\n\n[^note]: **bold**\n\n    continued\n\nAfter.\n\n$$\nx &= y\n$$';
    const blocks = blocksOf(source);
    expect(blocks).toMatchObject([
      {
        type: 'quote',
        callout: { type: 'warning', fold: '-', title: 'Title' },
        children: [
          { type: 'paragraph' },
          { type: 'quote', callout: { type: 'tip', title: 'Nested' } },
        ],
      },
      {
        type: 'footnoteDefinition',
        identifier: 'note',
        children: [{ type: 'paragraph' }, { type: 'paragraph' }],
      },
      { type: 'paragraph', children: [{ type: 'text', value: 'After.' }] },
      { type: 'math', value: 'x &= y' },
    ]);
  });

  test('does not apply markdown formatting inside raw HTML or comments', () => {
    const blocks = blocksOf(
      '<u>**literal** &amp; _also literal_</u> %%**hidden** [[hidden]]%%\n\n<div>\n[[raw]] **raw**\n</div>',
    );
    expect(blocks).toMatchObject([
      {
        type: 'paragraph',
        children: [
          {
            type: 'underline',
            children: [{ type: 'text', value: '**literal** & _also literal_' }],
          },
          { type: 'text', value: ' ' },
          {
            type: 'raw',
            value: '%%**hidden** [[hidden]]%%',
            dialect: 'obsidian',
          },
        ],
      },
      {
        type: 'raw',
        dialect: 'obsidian',
        value: '<div>\n[[raw]] **raw**\n</div>',
      },
    ]);
  });

  test('retains formatted callout titles semantically, including nested body and following list', () => {
    const source =
      '> [!warning]- A **bold** title\n> Body.\n>\n> - Item\n>   - Nested\n\nAfter';
    const document = parseObsidian(source);
    expect(document.blocks[0]).toMatchObject({
      type: 'quote',
      callout: {
        type: 'warning',
        fold: '-',
        titleNodes: [
          { type: 'text', value: 'A ' },
          { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
          { type: 'text', value: ' title' },
        ],
      },
      children: [{ type: 'paragraph' }, { type: 'list' }],
    });
    expect(document.blocks[1]).toMatchObject({ type: 'paragraph' });
  });

  test('keeps CRLF source offsets and lossless lexical coverage', () => {
    const source = '# Heading\r\n\r\nText **bold**\r\n';
    const document = parseObsidian(source);
    expect(document.blocks[0].range).toEqual({ start: 0, end: 11 });
    expect(document.blocks[1].range).toEqual({ start: 13, end: source.length });
    expect(document.tokens.map((token) => token.raw).join('')).toBe(source);
    for (const token of document.tokens) {
      expect(source.slice(token.range.start, token.range.end)).toBe(token.raw);
    }
  });

  test('treats nested static HTML as HTML semantics and keeps unsupported attributes as raw source', () => {
    const source =
      '<u>**literal** <strong>bold <em>and italic</em></strong> <code>\\*literal* &lt;x&gt;</code></u> <sup><a href="Folder/Note" title="Tooltip"><strong>link</strong></a></sup> <img src="image.png" onerror="danger()">';
    const document = parseObsidian(source);
    expect(document.blocks[0]).toMatchObject({
      children: [
        {
          type: 'underline',
          children: [
            { type: 'text', value: '**literal** ' },
            {
              type: 'strong',
              children: [
                { type: 'text', value: 'bold ' },
                {
                  type: 'emphasis',
                  children: [{ type: 'text', value: 'and italic' }],
                },
              ],
            },
            { type: 'text', value: ' ' },
            { type: 'code', value: '\\*literal* <x>' },
          ],
        },
        { type: 'text', value: ' ' },
        {
          type: 'superscript',
          children: [
            {
              type: 'link',
              target: 'Folder/Note',
              title: 'Tooltip',
              label: [{ type: 'strong' }],
            },
          ],
        },
        { type: 'text', value: ' ' },
        {
          type: 'raw',
          value: '<img src="image.png" onerror="danger()">',
          dialect: 'obsidian',
        },
      ],
    });
    expect(
      semanticBlocks(parseObsidian(serializeObsidian(document).text).blocks),
    ).toEqual(semanticBlocks(document.blocks));
  });

  test('ignores highlight delimiters inside complete code spans and respects exact backtick runs', () => {
    expect(blocksOf('==before ``code ``` == still code`` after==')).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'highlight',
            children: [
              { type: 'text', value: 'before ' },
              { type: 'code', value: 'code ``` == still code' },
              { type: 'text', value: ' after' },
            ],
          },
        ],
      },
    ]);
  });

  test('keeps literal raw regions inside quoted lists at the correct nesting depth', () => {
    const source =
      '> - First\n>\n>   <div class="custom">\n>   **literal**\n>   </div>\n>\n> - Last\n\n> %%a comment\n>\n> with a blank line%%';
    const document = parseObsidian(source);
    const emitted = serializeObsidian(document);
    expect(semanticBlocks(parseObsidian(emitted.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );
    expect(emitted.text).not.toContain('>   >');
  });

  test('preserves raw content inside footnotes without inventing nested source ranges', () => {
    const source =
      '[^n]: A definition\n\n    <div class="custom">\n    **literal**\n    </div>';
    const document = parseObsidian(source);
    expect(document.blocks[0]).toMatchObject({
      type: 'footnoteDefinition',
      children: [
        { type: 'paragraph' },
        { type: 'raw', value: '<div class="custom">\n**literal**\n</div>' },
      ],
    });
    expect(
      semanticBlocks(parseObsidian(serializeObsidian(document).text).blocks),
    ).toEqual(semanticBlocks(document.blocks));
  });

  test('extracts image alternate text independently of Markdown formatting', () => {
    expect(blocksOf('![a **strong** and _emphasized_ alt](image.png)')).toEqual(
      [
        {
          type: 'paragraph',
          children: [
            {
              type: 'embed',
              target: 'image.png',
              kind: 'image',
              alt: 'a strong and emphasized alt',
            },
          ],
        },
      ],
    );
  });
});

describe('Obsidian semantic serialization', () => {
  test.each([
    '# Nested **bold _emphasis_**\n\n- one\n  1. mixed\n  2. next\n- final',
    '> [!note]+ A title\n> **Body**\n>\n> > Nested quote',
    '| A | B |\n| :--- | ---: |\n| `a\\|b` | [[target\\|label]] |',
    'Escaped \\*text\\*, \\[\\[literal\\]\\], 2 < 3, &amp;, snake_case and `a``b`.',
    '`````js\n```\n**literal**\n```\n`````',
    'Text $x_1 + y$ [^n].\n\n[^n]: definition\n\n    continued',
    '![[media/picture.png|300x200]] ![alt](picture.png "title") [**label**](https://example.com/a_(b) "title")',
  ])(
    'maintains shared AST through canonical parse/emit cycles: %s',
    (source) => {
      const first = parseObsidian(source);
      const emitted = serializeObsidian(first);
      const second = parseObsidian(emitted.text);
      expect(semanticBlocks(second.blocks)).toEqual(
        semanticBlocks(first.blocks),
      );
      expect(serializeObsidian(second).text).toBe(emitted.text);
    },
  );

  test('resolves targets independently of aliases, inline labels and external URLs', () => {
    const document = parseObsidian(
      '[[folder/note|alias]] ![[folder/image.png|250]] [a **label**](folder/note.md) [site](https://example.org)',
    );
    const resolveLink = jest.fn(
      (target: string, kind: 'link' | 'embed') => `${kind}/${target}`,
    );
    const serialized = serializeObsidian(document, { resolveLink });
    expect(serialized.text).toContain('[[link/folder/note|alias]]');
    expect(serialized.text).toContain('![[embed/folder/image.png|250]]');
    expect(serialized.text).toContain('[a **label**](<link/folder/note.md>)');
    expect(serialized.text).toContain('[site](<https://example.org>)');
    expect(resolveLink).toHaveBeenCalledTimes(3);
  });

  test('foreign capsules restore exact dialect/source, including hostile comment terminators', () => {
    const preserved = {
      dialect: 'tiddlywiki' as const,
      value: '<$list filter="[all[tiddlers]]">--> [[x]]</$list>',
      reason: 'Dynamic widget',
    };
    const document: ParsedDocument = {
      dialect: 'tiddlywiki',
      source: preserved.value,
      blocks: [{ type: 'raw', ...preserved }],
      tokens: [],
      diagnostics: [],
    };
    const emitted = serializeObsidian(document);
    expect(emitted.text).toBe(encodePreservedSource(preserved));
    expect(emitted.diagnostics).toEqual([
      expect.objectContaining({
        code: 'PRESERVED_SOURCE',
        severity: 'warning',
      }),
    ]);
    expect(blocksOf(emitted.text)).toEqual([{ type: 'raw', ...preserved }]);
    expect(blocksOf(`before ${emitted.text} after`)).toMatchObject([
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'before ' },
          { type: 'raw', ...preserved },
          { type: 'text', value: ' after' },
        ],
      },
    ]);
  });

  test('complex corpus preserves structure after canonical serialization', () => {
    const document = parseObsidian(fixture('adversarial-nesting.md'));
    expect(document.blocks).toHaveLength(6);
    const emitted = serializeObsidian(document);
    expect(semanticBlocks(parseObsidian(emitted.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );
  });

  test('complex extension corpus remains present with explicit raw fallback', () => {
    const source = fixture('preserved-extensions.md');
    const document = parseObsidian(source);
    expect(document.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'raw', reason: 'YAML front matter' }),
        expect.objectContaining({
          type: 'quote',
          callout: expect.objectContaining({ titleNodes: expect.any(Array) }),
        }),
        expect.objectContaining({ type: 'math' }),
        expect.objectContaining({ type: 'footnoteDefinition' }),
        expect.objectContaining({ type: 'raw', reason: 'HTML block' }),
      ]),
    );
    const emitted = serializeObsidian(document);
    expect(emitted.text).toContain('custom:\n  nested: true');
    expect(emitted.text).toContain('> > ![[Other#Section]]');
    expect(emitted.text).toContain('%%a **comment** with [[links]]%%');
    expect(emitted.text).toContain('^block-id');
  });

  test.each(['', 'one line', 'one line\n', 'one line\n\n', '\n'])(
    'preserves intentional trailing blank lines in code AST: %j',
    (value) => {
      const document: ParsedDocument = {
        dialect: 'obsidian',
        source: '',
        blocks: [{ type: 'code', language: 'text', value }],
        tokens: [],
        diagnostics: [],
      };
      const emitted = serializeObsidian(document);
      expect(blocksOf(emitted.text)).toEqual(document.blocks);
      expect(serializeObsidian(parseObsidian(emitted.text)).text).toBe(
        emitted.text,
      );
    },
  );

  test('retains image dimensions, alt text and title together', () => {
    const document: ParsedDocument = {
      dialect: 'tiddlywiki',
      source: '',
      blocks: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'embed',
              kind: 'image',
              target: 'https://example.org/a.png',
              alt: 'Diagram & explanation',
              width: '320',
              height: '200',
              title: 'A title',
            },
          ],
        },
      ],
      tokens: [],
      diagnostics: [],
    };
    const emitted = serializeObsidian(document);
    expect(blocksOf(emitted.text)).toEqual(document.blocks);
  });

  test.each(['a|b', 'a\\|b', 'a\\\\|b', '|leading|trailing|'])(
    'retains pipes and backslashes in code within tables: %j',
    (value) => {
      const document: ParsedDocument = {
        dialect: 'obsidian',
        source: '',
        blocks: [
          {
            type: 'table',
            header: [[{ type: 'text', value: 'Code' }]],
            alignments: [null],
            rows: [[[{ type: 'code', value }]]],
          },
        ],
        tokens: [],
        diagnostics: [],
      };
      expect(blocksOf(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );

  test.each([
    'line\nbreak',
    ' two spaces ',
    '  ',
    '`backtick edge`',
    '``two and ` one',
  ])('preserves code span literal framing: %j', (value) => {
    const document: ParsedDocument = {
      dialect: 'obsidian',
      source: '',
      blocks: [{ type: 'paragraph', children: [{ type: 'code', value }] }],
      tokens: [],
      diagnostics: [],
    };
    expect(blocksOf(serializeObsidian(document).text)).toEqual(document.blocks);
  });
});

describe('Obsidian documented extensions and structural regressions', () => {
  test.each([
    ['![Diagram|100](image.png)', 'Diagram', '100', undefined],
    ['![Diagram|100x200](image.png)', 'Diagram', '100', '200'],
    ['![250](image.png)', '', '250', undefined],
    [
      '![**Bold** and _italic_|100x200](image.png)',
      'Bold and italic',
      '100',
      '200',
    ],
    ['![literal\\|100](image.png)', 'literal|100', undefined, undefined],
    ['![prefix|literal|100](image.png)', 'prefix|literal', '100', undefined],
  ])(
    'separates true alternate text and dimensions: %s',
    (source, alt, width, height) => {
      const document = parseObsidian(source as string);
      const paragraph = document.blocks[0];
      if (paragraph.type !== 'paragraph') {
        throw new Error('Expected an image paragraph');
      }
      expect(paragraph.children[0]).toMatchObject({ type: 'embed', alt });
      const embed = paragraph.children[0];
      if (embed.type !== 'embed') {
        throw new Error('Expected an image');
      }
      expect(embed.width).toBe(width);
      expect(embed.height).toBe(height);
      expect(
        semanticBlocks(parseObsidian(serializeObsidian(document).text).blocks),
      ).toEqual(semanticBlocks(document.blocks));
    },
  );

  test('keeps numeric literal HTML alt independent from dimensions, including title', () => {
    const document = parseObsidian(
      '<img src="chart.svg" alt="250" title="An actual numeric label">',
    );
    expect(blocksOf(serializeObsidian(document).text)).toEqual(
      semanticBlocks(document.blocks),
    );
    expect(blocksOf(serializeObsidian(document).text)).toMatchObject([
      { children: [{ alt: '250', title: 'An actual numeric label' }] },
    ]);
  });

  test.each(['x', 'X', '?', '-', '/', '!', ']', '[', '\\', '✅', '🟢'])(
    'retains completed task marker %s through nested lists and both dialects',
    (marker) => {
      const source = `> [!todo] Queue\n> - [${marker}] **Task** [^n]\n>   3. [ ] next\n>\n> [^n]: note\n>   continued`;
      const document = parseObsidian(source);
      expect(document.blocks[0]).toMatchObject({
        type: 'quote',
        children: expect.arrayContaining([
          expect.objectContaining({
            type: 'list',
            children: [expect.objectContaining({ checked: true })],
          }),
        ]),
      });
      const expected = normalizedSemanticBlocks(document.blocks);
      const converted = convertText(source, 'obsidian', 'tiddlywiki');
      const restored = convertText(converted.text, 'tiddlywiki', 'obsidian');
      expect(
        normalizedSemanticBlocks(parseObsidian(restored.text).blocks),
      ).toEqual(expected);
      expect(restored.text).toContain(`[${marker}]`);
    },
  );

  test('recognizes task markers before reference link resolution and preserves the actual body link', () => {
    const document = parseObsidian(
      '- [x] [documentation][x]\n\n[x]: https://example.org/help',
    );
    expect(document.blocks[0]).toMatchObject({
      type: 'list',
      children: [
        {
          checked: true,
          blocks: [
            {
              children: [
                {
                  type: 'link',
                  target: 'https://example.org/help',
                  label: [{ value: 'documentation' }],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('retains balanced inline footnotes exactly, including escaped brackets and code closers', () => {
    const inlineFootnote =
      '^[A [nested [label]] and `]` code plus \\] literal]';
    const source = `Before ${inlineFootnote} after.`;
    const document = parseObsidian(source);
    expect(document.blocks[0]).toMatchObject({
      children: [
        { type: 'text' },
        {
          type: 'raw',
          value: inlineFootnote,
          reason: 'Obsidian inline footnote',
        },
        { type: 'text' },
      ],
    });
    expect(document.diagnostics).toEqual([
      expect.objectContaining({ code: 'PRESERVED_INLINE_FOOTNOTE' }),
    ]);
    const converted = convertText(source, 'obsidian', 'tiddlywiki');
    const restored = convertText(
      converted.text.replace('Before', 'Edited'),
      'tiddlywiki',
      'obsidian',
    );
    expect(restored.text).toContain(inlineFootnote);
    expect(restored.text).toContain('Edited');
  });

  test.each(['\\^[escaped]', '`^[code]`', '^[unclosed [bracket]'])(
    'does not mistake protected or unclosed footnotes for a preserved construct: %s',
    (source) => {
      const document = parseObsidian(source);
      expect(document.diagnostics).toEqual([]);
      expect(JSON.stringify(document.blocks)).not.toContain(
        'Obsidian inline footnote',
      );
    },
  );

  test('supports two-space footnote continuation inside nested callouts and stops at the next paragraph', () => {
    const source =
      '> [!note] Outer\n> > [!tip] Inner\n> > Ref [^n].\n> >\n> > [^n]: first ^[inline]\n> >   continued **bold**\n> >\n> >   - nested definition list\n> >\n> > After.';
    const document = parseObsidian(source);
    expect(document.blocks[0]).toMatchObject({
      type: 'quote',
      children: [
        {
          type: 'quote',
          children: [
            { type: 'paragraph' },
            {
              type: 'footnoteDefinition',
              children: [{ type: 'paragraph' }, { type: 'list' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'After.' }],
            },
          ],
        },
      ],
    });
    expect(document.diagnostics).toEqual([
      expect.objectContaining({ code: 'PRESERVED_INLINE_FOOTNOTE' }),
    ]);
    expect(
      semanticBlocks(parseObsidian(serializeObsidian(document).text).blocks),
    ).toEqual(semanticBlocks(document.blocks));
  });

  test.each(['query', 'base', 'mermaid'])(
    'protects %s fence bodies from all extension rules',
    (language) => {
      const value =
        '[^n]: fake\n  continuation\n- [?] task\n![](https://youtu.be/video)\n^[inline] ==highlight== %%comment%%\n[[Note|alias]] **bold**\n```\n';
      const source = `\`\`\`\`${language}\n${value}\n\`\`\`\``;
      const document = parseObsidian(source);
      expect(semanticBlocks(document.blocks)).toEqual([
        { type: 'code', language, value },
      ]);
      expect(document.diagnostics).toEqual([]);
      const converted = convertText(source, 'obsidian', 'tiddlywiki');
      const restored = convertText(converted.text, 'tiddlywiki', 'obsidian');
      expect(semanticBlocks(parseObsidian(restored.text).blocks)).toEqual(
        semanticBlocks(document.blocks),
      );
    },
  );

  test.each([
    '![](https://www.youtube.com/watch?v=video&t=32)',
    '![video](<https://youtu.be/video> "Original title")',
    '![](https://twitter.com/obsdmd/status/1580548874246443010)',
    '![](https://x.com/obsdmd/status/1580548874246443010)',
  ])(
    'preserves provider web embeds as exact source with a diagnostic: %s',
    (source) => {
      const document = parseObsidian(source);
      expect(document.blocks).toMatchObject([
        {
          type: 'paragraph',
          children: [
            { type: 'raw', value: source, reason: 'Obsidian web embed' },
          ],
        },
      ]);
      expect(document.diagnostics).toEqual([
        expect.objectContaining({ code: 'PRESERVED_WEB_EMBED' }),
      ]);
      const converted = convertText(
        `Before ${source} after`,
        'obsidian',
        'tiddlywiki',
      );
      const restored = convertText(converted.text, 'tiddlywiki', 'obsidian');
      expect(restored.text).toContain(source);
    },
  );

  test.each([
    'https://example.org/image-endpoint?id=1',
    'https://youtube.com/image.png',
    'https://youtube.com.attacker.example/watch?v=video',
    'https://twitter.com/obsdmd/profile.png',
  ])('keeps ordinary image endpoints as images: %s', (target) => {
    const document = parseObsidian(`![alt](${target})`);
    expect(document.blocks).toMatchObject([
      { children: [{ type: 'embed', kind: 'image', target, alt: 'alt' }] },
    ]);
    expect(document.diagnostics).toEqual([]);
  });

  test('retains iframe HTML unchanged with an explicit embed diagnostic', () => {
    const source =
      '<iframe src="https://example.org/embed" width="560" allowfullscreen></iframe>';
    const document = parseObsidian(source);
    expect(document.diagnostics).toEqual([
      expect.objectContaining({ code: 'PRESERVED_IFRAME_EMBED' }),
    ]);
    const converted = convertText(source, 'obsidian', 'tiddlywiki');
    expect(convertText(converted.text, 'tiddlywiki', 'obsidian').text).toBe(
      source,
    );
  });

  test('keeps repeated thematic rules distinct from YAML front matter', () => {
    const document = parseObsidian('***\n\n- - -\n\n___');
    const serialized = serializeObsidian(document);
    expect(serialized.text).toBe('***\n\n***\n\n***');
    expect(blocksOf(serialized.text)).toEqual([
      { type: 'thematicBreak' },
      { type: 'thematicBreak' },
      { type: 'thematicBreak' },
    ]);
  });

  test('escapes a list-looking paragraph even when entity decoding split the text nodes', () => {
    const document: ParsedDocument = {
      dialect: 'tiddlywiki',
      source: '',
      tokens: [],
      diagnostics: [],
      blocks: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'Text\n' },
            { type: 'text', value: '-' },
            { type: 'text', value: ' literal marker' },
          ],
        },
      ],
    };
    expect(blocksOf(serializeObsidian(document).text)).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Text' },
          { type: 'break', hard: false },
          { type: 'text', value: '- literal marker' },
        ],
      },
    ]);
    expect(document.blocks[0]).toMatchObject({
      children: [
        { value: 'Text\n' },
        { value: '-' },
        { value: ' literal marker' },
      ],
    });
  });

  test.each([true, false])(
    'preserves consecutive separate list blocks (ordered=%s)',
    (ordered) => {
      const document: ParsedDocument = {
        dialect: 'tiddlywiki',
        source: '',
        tokens: [],
        diagnostics: [],
        blocks: ['first', 'second', 'third'].map((value) => ({
          type: 'list',
          ordered,
          start: 1,
          children: [
            {
              blocks: [
                { type: 'paragraph', children: [{ type: 'text', value }] },
              ],
            },
          ],
        })),
      };
      expect(blocksOf(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );

  test('parses adjacent inline preservation comments as a paragraph at a list boundary', () => {
    const first = {
      dialect: 'tiddlywiki' as const,
      value: '{{a.png}}',
      reason: 'Image-like transclusion',
    };
    const second = {
      dialect: 'tiddlywiki' as const,
      value: '{{b.png}}',
      reason: 'Image-like transclusion',
    };
    const source = `- ${encodePreservedSource(first)} then ${encodePreservedSource(second)}`;
    expect(blocksOf(source)).toMatchObject([
      {
        type: 'list',
        children: [
          {
            blocks: [
              {
                type: 'paragraph',
                children: [
                  { type: 'raw', ...first },
                  { type: 'text', value: ' then ' },
                  { type: 'raw', ...second },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  const formatOrders = Array.from({ length: 16 }, (_, pattern) =>
    Array.from({ length: 4 }, (_, depth) =>
      pattern & (1 << depth) ? ('strong' as const) : ('emphasis' as const),
    ),
  );
  test.each(formatOrders.map((order) => [order.join('/'), order] as const))(
    'retains format nesting order and intraword adjacency: %s',
    (_, order) => {
      let formatted: InlineNode = { type: 'text', value: 'inside' };
      for (const type of order) {
        formatted = { type, children: [formatted] };
      }
      const document: ParsedDocument = {
        dialect: 'tiddlywiki',
        source: '',
        tokens: [],
        diagnostics: [],
        blocks: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', value: 'prefix' },
              formatted,
              { type: 'text', value: 'suffix' },
            ],
          },
        ],
      };
      expect(blocksOf(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );
});
