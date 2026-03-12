import { lexObsidian } from '../../lexer/obsidianLexer';
import { lexTiddlywiki } from '../../lexer/tiddlywikiLexer';
import { serializeObsidian } from '../../lexer/obsidianSerializer';
import { serializeTiddlywiki } from '../../lexer/tiddlywikiSerializer';
import { BlockToken } from '../../lexer/types';

// ---------------------------------------------------------------------------
// lexObsidian — heading tokenisation
// ---------------------------------------------------------------------------

describe('lexObsidian – heading tokens', () => {
  it.each([
    ['# H1', 1, 'H1'],
    ['## H2', 2, 'H2'],
    ['### H3', 3, 'H3'],
    ['#### H4', 4, 'H4'],
    ['##### H5', 5, 'H5'],
    ['###### H6', 6, 'H6'],
  ] as [string, number, string][])(
    'parses "%s" as level-%i heading',
    (line, level, text) => {
      expect(lexObsidian(line)).toEqual([
        { type: 'heading', level, rawText: text },
      ]);
    },
  );

  it('preserves rawText verbatim including inline markdown', () => {
    // Inline formatting is NOT converted by the heading lexer — it stays raw
    // so a downstream inline parser can handle it in a future pass.
    expect(lexObsidian('# Heading with **bold** and _italic_')).toEqual([
      { type: 'heading', level: 1, rawText: 'Heading with **bold** and _italic_' },
    ]);
  });

  it('does not treat #tag (no space) as a heading', () => {
    expect(lexObsidian('#notaheading')).toEqual([
      { type: 'paragraph', rawText: '#notaheading' },
    ]);
  });

  it('does not treat 7+ hashes as a heading', () => {
    expect(lexObsidian('####### too deep')).toEqual([
      { type: 'paragraph', rawText: '####### too deep' },
    ]);
  });

  it('emits a blank token for empty lines', () => {
    expect(lexObsidian('')).toEqual([{ type: 'blank' }]);
  });

  it('emits a blank token for whitespace-only lines', () => {
    expect(lexObsidian('   ')).toEqual([{ type: 'blank' }]);
  });

  it('emits paragraph tokens for non-heading content', () => {
    expect(lexObsidian('Plain paragraph text')).toEqual([
      { type: 'paragraph', rawText: 'Plain paragraph text' },
    ]);
  });

  it('tokenises a multi-line document with headings, blanks, and paragraphs', () => {
    const input = '# Title\n\nSome paragraph\n\n## Sub-section\n\nMore text';
    expect(lexObsidian(input)).toEqual([
      { type: 'heading', level: 1, rawText: 'Title' },
      { type: 'blank' },
      { type: 'paragraph', rawText: 'Some paragraph' },
      { type: 'blank' },
      { type: 'heading', level: 2, rawText: 'Sub-section' },
      { type: 'blank' },
      { type: 'paragraph', rawText: 'More text' },
    ]);
  });

  it('tokenises all six heading levels in sequence', () => {
    const input = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    const tokens = lexObsidian(input);
    const levels = tokens
      .filter((t): t is Extract<BlockToken, { type: 'heading' }> => t.type === 'heading')
      .map((t) => t.level);
    expect(levels).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

// ---------------------------------------------------------------------------
// lexTiddlywiki — heading tokenisation
// ---------------------------------------------------------------------------

describe('lexTiddlywiki – heading tokens', () => {
  it.each([
    ['! H1', 1, 'H1'],
    ['!! H2', 2, 'H2'],
    ['!!! H3', 3, 'H3'],
    ['!!!! H4', 4, 'H4'],
    ['!!!!! H5', 5, 'H5'],
    ['!!!!!! H6', 6, 'H6'],
  ] as [string, number, string][])(
    'parses "%s" as level-%i heading',
    (line, level, text) => {
      expect(lexTiddlywiki(line)).toEqual([
        { type: 'heading', level, rawText: text },
      ]);
    },
  );

  it('preserves rawText verbatim including inline wikitext', () => {
    expect(lexTiddlywiki("! Heading with ''bold'' and //italic//")).toEqual([
      { type: 'heading', level: 1, rawText: "Heading with ''bold'' and //italic//" },
    ]);
  });

  it('does not treat ![[transclusion]] as a heading', () => {
    expect(lexTiddlywiki('![[image.jpg]]')).toEqual([
      { type: 'paragraph', rawText: '![[image.jpg]]' },
    ]);
  });

  it('does not treat !word (no space) as a heading', () => {
    expect(lexTiddlywiki('!notaheading')).toEqual([
      { type: 'paragraph', rawText: '!notaheading' },
    ]);
  });

  it('does not treat 7+ bangs as a heading', () => {
    expect(lexTiddlywiki('!!!!!!! too deep')).toEqual([
      { type: 'paragraph', rawText: '!!!!!!! too deep' },
    ]);
  });

  it('emits a blank token for empty lines', () => {
    expect(lexTiddlywiki('')).toEqual([{ type: 'blank' }]);
  });

  it('emits paragraph tokens for non-heading content', () => {
    expect(lexTiddlywiki('Plain paragraph text')).toEqual([
      { type: 'paragraph', rawText: 'Plain paragraph text' },
    ]);
  });

  it('tokenises a multi-line document', () => {
    const input = '! Title\n\nSome paragraph\n\n!! Sub-section\n\nMore text';
    expect(lexTiddlywiki(input)).toEqual([
      { type: 'heading', level: 1, rawText: 'Title' },
      { type: 'blank' },
      { type: 'paragraph', rawText: 'Some paragraph' },
      { type: 'blank' },
      { type: 'heading', level: 2, rawText: 'Sub-section' },
      { type: 'blank' },
      { type: 'paragraph', rawText: 'More text' },
    ]);
  });

  it('tokenises all six heading levels in sequence', () => {
    const input = '! H1\n!! H2\n!!! H3\n!!!! H4\n!!!!! H5\n!!!!!! H6';
    const tokens = lexTiddlywiki(input);
    const levels = tokens
      .filter((t): t is Extract<BlockToken, { type: 'heading' }> => t.type === 'heading')
      .map((t) => t.level);
    expect(levels).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

// ---------------------------------------------------------------------------
// serializeObsidian
// ---------------------------------------------------------------------------

describe('serializeObsidian', () => {
  it.each([
    [1, '# Hello'],
    [2, '## Hello'],
    [3, '### Hello'],
    [4, '#### Hello'],
    [5, '##### Hello'],
    [6, '###### Hello'],
  ] as [number, string][])(
    'serialises level-%i heading with # markers',
    (level, expected) => {
      expect(
        serializeObsidian([{ type: 'heading', level: level as 1, rawText: 'Hello' }]),
      ).toBe(expected);
    },
  );

  it('serialises blank as an empty string', () => {
    expect(serializeObsidian([{ type: 'blank' }])).toBe('');
  });

  it('serialises paragraph as-is', () => {
    expect(
      serializeObsidian([{ type: 'paragraph', rawText: 'Some text' }]),
    ).toBe('Some text');
  });

  it('joins multiple tokens with newlines', () => {
    const tokens: BlockToken[] = [
      { type: 'heading', level: 1, rawText: 'Title' },
      { type: 'blank' },
      { type: 'paragraph', rawText: 'Body' },
    ];
    expect(serializeObsidian(tokens)).toBe('# Title\n\nBody');
  });
});

// ---------------------------------------------------------------------------
// serializeTiddlywiki
// ---------------------------------------------------------------------------

describe('serializeTiddlywiki', () => {
  it.each([
    [1, '! Hello'],
    [2, '!! Hello'],
    [3, '!!! Hello'],
    [4, '!!!! Hello'],
    [5, '!!!!! Hello'],
    [6, '!!!!!! Hello'],
  ] as [number, string][])(
    'serialises level-%i heading with ! markers',
    (level, expected) => {
      expect(
        serializeTiddlywiki([{ type: 'heading', level: level as 1, rawText: 'Hello' }]),
      ).toBe(expected);
    },
  );

  it('serialises blank as an empty string', () => {
    expect(serializeTiddlywiki([{ type: 'blank' }])).toBe('');
  });

  it('serialises paragraph as-is', () => {
    expect(
      serializeTiddlywiki([{ type: 'paragraph', rawText: 'Some text' }]),
    ).toBe('Some text');
  });

  it('joins multiple tokens with newlines', () => {
    const tokens: BlockToken[] = [
      { type: 'heading', level: 1, rawText: 'Title' },
      { type: 'blank' },
      { type: 'paragraph', rawText: 'Body' },
    ];
    expect(serializeTiddlywiki(tokens)).toBe('! Title\n\nBody');
  });
});

// ---------------------------------------------------------------------------
// Round-trip: Obsidian → tokens → TiddlyWiki
// ---------------------------------------------------------------------------

describe('round-trip: Obsidian → TiddlyWiki', () => {
  it('converts H1–H6 headings', () => {
    const input = '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6';
    const expected = '! H1\n\n!! H2\n\n!!! H3\n\n!!!! H4\n\n!!!!! H5\n\n!!!!!! H6';
    expect(serializeTiddlywiki(lexObsidian(input))).toBe(expected);
  });

  it('preserves blank lines between headings', () => {
    const input = '# A\n\n\n## B';
    const expected = '! A\n\n\n!! B';
    expect(serializeTiddlywiki(lexObsidian(input))).toBe(expected);
  });

  it('preserves paragraph content verbatim', () => {
    const input = '# Title\n\nThis is a paragraph with **bold** text.';
    const expected = '! Title\n\nThis is a paragraph with **bold** text.';
    expect(serializeTiddlywiki(lexObsidian(input))).toBe(expected);
  });

  it('treats #tag (no space) as a paragraph, not a heading', () => {
    const input = '#notaheading';
    expect(serializeTiddlywiki(lexObsidian(input))).toBe('#notaheading');
  });

  it('does not treat 7-hash line as a heading', () => {
    const input = '####### too deep';
    expect(serializeTiddlywiki(lexObsidian(input))).toBe('####### too deep');
  });

  it('converts a realistic note excerpt', () => {
    const input = [
      '# Main Title',
      '',
      'Introductory paragraph.',
      '',
      '## Section One',
      '',
      'Section content here.',
      '',
      '### Sub-section',
      '',
      'More content.',
    ].join('\n');

    const expected = [
      '! Main Title',
      '',
      'Introductory paragraph.',
      '',
      '!! Section One',
      '',
      'Section content here.',
      '',
      '!!! Sub-section',
      '',
      'More content.',
    ].join('\n');

    expect(serializeTiddlywiki(lexObsidian(input))).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: TiddlyWiki → tokens → Obsidian
// ---------------------------------------------------------------------------

describe('round-trip: TiddlyWiki → Obsidian', () => {
  it('converts H1–H6 headings', () => {
    const input = '! H1\n\n!! H2\n\n!!! H3\n\n!!!! H4\n\n!!!!! H5\n\n!!!!!! H6';
    const expected = '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6';
    expect(serializeObsidian(lexTiddlywiki(input))).toBe(expected);
  });

  it('preserves blank lines between headings', () => {
    const input = '! A\n\n\n!! B';
    const expected = '# A\n\n\n## B';
    expect(serializeObsidian(lexTiddlywiki(input))).toBe(expected);
  });

  it('preserves paragraph content verbatim', () => {
    const input = "! Title\n\nParagraph with ''bold'' text.";
    const expected = "# Title\n\nParagraph with ''bold'' text.";
    expect(serializeObsidian(lexTiddlywiki(input))).toBe(expected);
  });

  it('treats ![[transclusion]] as a paragraph, not a heading', () => {
    const input = '![[image.jpg]]';
    expect(serializeObsidian(lexTiddlywiki(input))).toBe('![[image.jpg]]');
  });

  it('does not treat !word (no space) as a heading', () => {
    const input = '!notaheading';
    expect(serializeObsidian(lexTiddlywiki(input))).toBe('!notaheading');
  });

  it('does not treat 7-bang line as a heading', () => {
    const input = '!!!!!!! too deep';
    expect(serializeObsidian(lexTiddlywiki(input))).toBe('!!!!!!! too deep');
  });

  it('converts a realistic tiddler excerpt', () => {
    const input = [
      '! Main Title',
      '',
      'Introductory paragraph.',
      '',
      '!! Section One',
      '',
      'Section content here.',
      '',
      '!!! Sub-section',
      '',
      'More content.',
    ].join('\n');

    const expected = [
      '# Main Title',
      '',
      'Introductory paragraph.',
      '',
      '## Section One',
      '',
      'Section content here.',
      '',
      '### Sub-section',
      '',
      'More content.',
    ].join('\n');

    expect(serializeObsidian(lexTiddlywiki(input))).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Symmetric round-trip: Obsidian → TiddlyWiki → Obsidian
// ---------------------------------------------------------------------------

describe('symmetric round-trip', () => {
  it('Obsidian → TiddlyWiki → Obsidian preserves the original', () => {
    const original = '# Title\n\n## Section\n\nParagraph text.\n\n### Sub-section';
    const result = serializeObsidian(lexTiddlywiki(serializeTiddlywiki(lexObsidian(original))));
    expect(result).toBe(original);
  });

  it('TiddlyWiki → Obsidian → TiddlyWiki preserves the original', () => {
    const original = '! Title\n\n!! Section\n\nParagraph text.\n\n!!! Sub-section';
    const result = serializeTiddlywiki(lexObsidian(serializeObsidian(lexTiddlywiki(original))));
    expect(result).toBe(original);
  });
});
