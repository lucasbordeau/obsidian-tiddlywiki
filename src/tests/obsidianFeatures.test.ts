import { readFileSync } from 'fs';
import { join } from 'path';
import { convertText } from '../modules/conversion-core/convertText';
import { parseObsidian } from '../modules/conversion-core/markdown/parseObsidian';
import { BlockNode } from '../modules/conversion-core/types/BlockNode';
import { InlineNode } from '../modules/conversion-core/types/InlineNode';
import { semanticBlocks } from './utils/semanticBlocks';
import { renderTiddlyWiki } from './utils/renderTiddlyWiki';

function allInlines(blocks: BlockNode[]): InlineNode[] {
  const descendants: InlineNode[] = [];
  const visitInlines = (inlines: InlineNode[]): void => {
    for (const inline of inlines) {
      descendants.push(inline);
      if ('children' in inline) {
        visitInlines(inline.children);
      }
      if (inline.type === 'link') {
        visitInlines(inline.label);
      }
    }
  };
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        visitInlines(block.children);
        break;
      case 'quote':
      case 'footnoteDefinition':
        descendants.push(...allInlines(block.children));
        break;
      case 'list':
        for (const entry of block.children) {
          descendants.push(...allInlines(entry.blocks));
        }
        break;
      case 'table':
        for (const cell of [...block.header, ...block.rows.flat()]) {
          visitInlines(cell);
        }
        break;
    }
  }
  return descendants;
}

function stableRoundTrip(source: string): string {
  const expected = semanticBlocks(parseObsidian(source).blocks);
  let markdown = source;
  for (let cycle = 0; cycle < 3; cycle++) {
    const outgoing = convertText(markdown, 'obsidian', 'tiddlywiki');
    markdown = convertText(outgoing.text, 'tiddlywiki', 'obsidian').text;
    expect(semanticBlocks(parseObsidian(markdown).blocks)).toEqual(expected);
  }
  return markdown;
}

const imageExtensions = [
  'avif',
  'bmp',
  'gif',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
];
const attachmentExtensions = [
  'md',
  'base',
  'canvas',
  'flac',
  'm4a',
  'mp3',
  'ogg',
  'wav',
  'webm',
  '3gp',
  'mkv',
  'mov',
  'mp4',
  'ogv',
  'pdf',
];
const imageContexts = [
  ['paragraph', 'Before **bold** IMAGE after `[[literal]]`.'],
  ['callout', '> [!info]+ Images\n> IMAGE and ==bright==.'],
  ['task list', '- [ ] Preview IMAGE\n  - Nested [[Note#Heading|label]]'],
  [
    'table',
    '| Preview | Details |\n| :-- | --: |\n| IMAGE | **bold** and `code` |',
  ],
];

describe('official Obsidian feature inventory', () => {
  describe.each(imageExtensions)('O-IMAGE: .%s', (extension) => {
    test.each(imageContexts)(
      '%s retains local image identity, dimensions and nesting',
      (_context, template) => {
        const target = `assets/研究 café (final).${extension}`;
        const source = template.replace(
          'IMAGE',
          `![[${target}${template.includes('| Preview') ? '\\|' : '|'}320x180]]`,
        );
        const images = allInlines(parseObsidian(source).blocks).filter(
          (node) => node.type === 'embed',
        );
        expect(images).toEqual([
          expect.objectContaining({
            type: 'embed',
            kind: 'image',
            target,
            width: '320',
            height: '180',
          }),
        ]);
        stableRoundTrip(source);
      },
    );
  });

  test.each(attachmentExtensions)(
    'O-FILE: .%s attachments retain their exact target in embeds and links',
    (extension) => {
      const target = `Attachments/été report (v2).${extension}`;
      const source = `[[${target}|Download **literal alias**]]\n\n> [!example]- Preview\n> ![[${target}]]\n>\n> - [x] File is linked`;
      const references = allInlines(parseObsidian(source).blocks).filter(
        (node) => node.type === 'link' || node.type === 'embed',
      );
      expect(references).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'link', target }),
          expect.objectContaining({ type: 'embed', kind: 'note', target }),
        ]),
      );
      stableRoundTrip(source);
    },
  );

  test.each([
    'Reports/Study.pdf#page=17',
    'Reports/Study.pdf#height=480',
    'Reports/Study.pdf#page=17&height=480',
    'Notes/Study#Results',
    'Notes/Study#Results#Nested heading',
    'Notes/Study#^list-id',
    '#Local heading',
    '#^local-block',
  ])(
    'O-ANCHOR-EMBED: host-specific fragment %s is recoverable and diagnosed',
    (target) => {
      const source = `Before ![[${target}]] and **after**.`;
      const outgoing = convertText(source, 'obsidian', 'tiddlywiki');
      expect(outgoing.diagnostics.length).toBeGreaterThan(0);
      expect(stableRoundTrip(source)).toContain(target);
    },
  );

  test.each([
    [
      'remote alt and title',
      '![Visible **alt**](https://example.org/image_(a).svg?x=1&y=2 "Tooltip")',
      { alt: 'Visible alt', title: 'Tooltip' },
    ],
    [
      'reference image',
      '![Diagram][figure]\n\n[figure]: https://example.org/a.svg "Legend"',
      { alt: 'Diagram', title: 'Legend' },
    ],
    [
      'relative Markdown image',
      '![drawing](<assets/two words.png> "Study")',
      { alt: 'drawing', title: 'Study' },
    ],
    [
      'escaped alt delimiters',
      '![a \\[b\\] and \\*c\\*](https://example.org/a.png)',
      { alt: 'a [b] and *c*' },
    ],
    [
      'width and height',
      '![Diagram|300x120](https://example.org/a.svg "Legend")',
      { alt: 'Diagram', width: '300', height: '120', title: 'Legend' },
    ],
    [
      'width',
      '![Diagram|300](https://example.org/a.svg)',
      { alt: 'Diagram', width: '300' },
    ],
    [
      'numeric width',
      '![250](https://example.org/a.svg)',
      { alt: '', width: '250' },
    ],
  ])('O-MARKDOWN-IMAGE: %s', (_description, source, expected) => {
    const embeds = allInlines(parseObsidian(source as string).blocks).filter(
      (node) => node.type === 'embed',
    );
    expect(embeds).toEqual([expect.objectContaining(expected)]);
    stableRoundTrip(source as string);
  });

  test('O-IMAGE-RENDER: real TiddlyWiki renders an external image with distinct alt, tooltip and size', async () => {
    const source =
      '![A & B|300x120](https://example.org/image.png?x=1&y=2 "A different title")';
    const outgoing = convertText(source, 'obsidian', 'tiddlywiki');
    const html = await renderTiddlyWiki(outgoing.text);
    expect(html).toContain('<img');
    expect(html).toContain('alt="A &amp; B"');
    expect(html).toContain('title="A different title"');
    expect(html).toContain('width="300"');
    expect(html).toContain('height="120"');
    expect(html).toContain('src="https://example.org/image.png?x=1&amp;y=2"');
  });

  test.each([
    '[[Note]]',
    '[[Note.md]]',
    '[[Folder/Note#Heading|Alias]]',
    '[[#Local heading]]',
    '[[Note#Parent#Child]]',
    '[[Note#^block-12]]',
    '[**rich** label](Folder/Note.md#Heading "title")',
    '[spaces](Folder/Two%20Words.md)',
    '[attachment](Reports/Study.pdf#page=4)',
    '[web](https://example.org/a_(b)?x=1&y=2#part)',
    '[email](mailto:person@example.org)',
    '[vault](obsidian://open?vault=Lab&file=Note)',
    '<https://example.org/a?q=1&b=2>',
    '[reference][id]\n\n[id]: Folder/Note.md "title"',
  ])('O-LINK: %s preserves destination and label semantics', (source) => {
    expect(
      allInlines(parseObsidian(source).blocks).some(
        (node) => node.type === 'link',
      ),
    ).toBe(true);
    stableRoundTrip(source);
  });

  test.each([
    'note',
    'abstract',
    'summary',
    'tldr',
    'info',
    'todo',
    'tip',
    'hint',
    'important',
    'success',
    'check',
    'done',
    'question',
    'help',
    'faq',
    'warning',
    'caution',
    'attention',
    'failure',
    'fail',
    'missing',
    'danger',
    'error',
    'bug',
    'example',
    'quote',
    'cite',
    'NOTE',
    'custom-review',
  ])(
    'O-CALLOUT: %s retains type, folding, rich title, media and nested content',
    (type) => {
      const source = `> [!${type}]- **Title** [[Note|alias]]\n> Text ![[assets/a.png|120]] and $x_1$.\n>\n> > [!tip]+ Nested\n> > - [x] finished\n> > - [ ] waiting`;
      expect(parseObsidian(source).blocks[0]).toMatchObject({
        type: 'quote',
        callout: { type, fold: '-', title: 'Title alias' },
      });
      stableRoundTrip(source);
    },
  );

  test.each([
    '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6',
    'Heading\n=======\n\nSubheading\n----------',
    '**strong** __strong__ *italic* _italic_ ***both*** ~~strike~~ ==highlight==',
    '**bold with _inner italic_ and ==bright==** plus ~~*removed*~~',
    'First line  \nhard break\\\nsecond hard break\nsoft break\n\nNew paragraph.',
    '- list\n  + nested\n    * deep\n      3. numbered\n         7) second',
    '17. ordered\n\n    Second paragraph\n\n    > quotation\n\n18. final',
    '***\n\n- - -\n\n___',
    '| **Name** | `Code` |\n| :-- | --: |\n| [[Note\\|Alias]] | `a\\|b` |\n| ![[a.svg\\|80]] | $x$ |',
    '\\*literal\\* \\# heading \\[brackets\\] 1\\. literal &amp; &#x1F680; café',
    'Inline `**literal** [[link]]` and `` `inside` %% literal %% ``.',
  ])('O-BASIC: composed formatting remains stable: %s', (source) => {
    stableRoundTrip(source);
  });

  test.each([
    [
      'html iframe',
      '<iframe src="https://example.org/embed?a=1&amp;b=2" width="640" height="320"></iframe>',
    ],
    [
      'HTML video',
      '<video controls src="assets/film.mp4"><track src="captions.vtt"></video>',
    ],
    [
      'HTML audio',
      '<audio controls><source src="assets/audio.ogg" type="audio/ogg"></audio>',
    ],
    [
      'HTML details',
      '<details><summary>Open</summary>**literal** [[literal]]</details>',
    ],
    [
      'styled HTML',
      '<div class="custom" style="color:red">**literal** <span>[[literal]]</span></div>',
    ],
    ['HTML comment', '<!-- ![[hidden.png]] **hidden** -->'],
    ['inline comment', '%% ![[hidden.pdf]] [[hidden]] **hidden** %%'],
    ['multiline comment', '%%\n# hidden heading\n\n![[hidden.png]]\n%%'],
    ['block identifier', 'A paragraph with **bold**. ^evidence-42'],
    ['structured block identifier', '- One\n- Two\n\n^list-id'],
    [
      'inline footnote',
      'A claim^[A **strong** aside with [[Note|alias]] and `]`].',
    ],
  ])(
    'O-PRESERVED: %s survives a neighboring edit with diagnostics',
    (_description, source) => {
      const outgoing = convertText(
        `${source}\n\n## Neighbor`,
        'obsidian',
        'tiddlywiki',
      );
      expect(outgoing.diagnostics.length).toBeGreaterThan(0);
      const incoming = convertText(
        outgoing.text.replace('Neighbor', 'Edited neighbor'),
        'tiddlywiki',
        'obsidian',
      );
      expect(incoming.text).toContain('Edited neighbor');
      const expectedRaw = allInlines(parseObsidian(source).blocks).filter(
        (node) => node.type === 'raw',
      );
      for (const raw of expectedRaw) {
        if (raw.type === 'raw') {
          expect(incoming.text).toContain(raw.value);
        }
      }
      stableRoundTrip(source);
    },
  );

  test.each([
    [
      'mermaid',
      'flowchart LR\n  A["[[Note]] **literal**"] --> B["PDF | image"]\n  class A internal-link;',
    ],
    [
      'query',
      'path:"Projects/été" (tag:#research OR file:.pdf) -content:"[[literal]]"',
    ],
    [
      'base',
      'filters:\n  and:\n    - file.ext == "pdf"\nformulas:\n  label: \'"[[" + file.name + "]]"\'\nviews:\n  - type: table\n    name: Documents',
    ],
    [
      'dataview',
      'TABLE file.link, "**literal**"\nFROM "Research"\nWHERE contains(file.tags, "#pdf")',
    ],
    [
      'javascript',
      'const source = "[[Note]] **bold** ![[photo.png]]";\n/* @@text@@ */',
    ],
    [
      'text',
      '```\n~~~\n| a | b |\n$$ x $$\n<$list filter="[all[tiddlers]]"/>\n',
    ],
  ])(
    'O-FENCED: %s retains literal code and language through three cycles',
    (language, literal) => {
      const source = `\`\`\`\`\`${language}\n${literal}\n\`\`\`\`\``;
      expect(parseObsidian(source).blocks).toEqual([
        expect.objectContaining({ type: 'code', language, value: literal }),
      ]);
      const restored = stableRoundTrip(source);
      expect(parseObsidian(restored).blocks[0]).toMatchObject({
        type: 'code',
        language,
        value: literal,
      });
    },
  );

  test.each([
    '$x_1 + \\frac{a}{b} = [[literal]]$',
    '$$\n\\begin{aligned}\na & = b \\\\\nc & = \\frac{1}{2}\n\\end{aligned}\n$$',
    '$$x^2 + y^2$$',
    'Claim[^long-id] and another[^long-id].\n\n[^long-id]: **bold** ![[a.png|100]]\n  continuation with `code`\n\n  second paragraph',
  ])('O-MATH-FOOTNOTE: %s', (source) => {
    stableRoundTrip(source);
  });

  test('O-COMPOUND: the media laboratory survives repeated whole-document conversion', () => {
    const source = readFileSync(
      join(__dirname, 'samples/conversion-core/obsidian-media-laboratory.md'),
      'utf8',
    );
    const inlines = allInlines(parseObsidian(source).blocks);
    expect(
      inlines.filter((node) => node.type === 'embed').length,
    ).toBeGreaterThanOrEqual(10);
    expect(inlines.some((node) => node.type === 'math')).toBe(true);
    stableRoundTrip(source);
  });
});
