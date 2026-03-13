import { parseObsidianInline, parseTiddlywikiInline } from '../../lexer/inlineLexer';
import { serializeObsidianInline, serializeObsidian } from '../../lexer/obsidianSerializer';
import { serializeTiddlywikiInline, serializeTiddlywiki } from '../../lexer/tiddlywikiSerializer';
import { lexObsidian } from '../../lexer/obsidianLexer';
import { lexTiddlywiki } from '../../lexer/tiddlywikiLexer';
import { InlineToken } from '../../lexer/types';

// Helpers
const text = (value: string): InlineToken => ({ type: 'text', value });
const bold = (...children: InlineToken[]): InlineToken => ({ type: 'bold', children });
const italic = (...children: InlineToken[]): InlineToken => ({ type: 'italic', children });
const underline = (...children: InlineToken[]): InlineToken => ({ type: 'underline', children });
const code = (value: string): InlineToken => ({ type: 'inlineCode', value });

// ---------------------------------------------------------------------------
// parseObsidianInline
// ---------------------------------------------------------------------------

describe('parseObsidianInline', () => {
  it('parses plain text as a single text token', () => {
    expect(parseObsidianInline('hello world')).toEqual([text('hello world')]);
  });

  it('returns empty array for empty string', () => {
    expect(parseObsidianInline('')).toEqual([]);
  });

  it('parses **bold**', () => {
    expect(parseObsidianInline('**bold text**')).toEqual([bold(text('bold text'))]);
  });

  it('parses _italic_', () => {
    expect(parseObsidianInline('_italic text_')).toEqual([italic(text('italic text'))]);
  });

  it('parses <u>underline</u>', () => {
    expect(parseObsidianInline('<u>underlined text</u>')).toEqual([
      underline(text('underlined text')),
    ]);
  });

  it('parses `inline code`', () => {
    expect(parseObsidianInline('Inline `code` is preserved')).toEqual([
      text('Inline '),
      code('code'),
      text(' is preserved'),
    ]);
  });

  it('parses **bold with _italic inside_**', () => {
    expect(parseObsidianInline('**bold with _italic inside_**')).toEqual([
      bold(text('bold with '), italic(text('italic inside'))),
    ]);
  });

  it('parses _italic with **bold inside**_', () => {
    expect(parseObsidianInline('_italic with **bold inside**_')).toEqual([
      italic(text('italic with '), bold(text('bold inside'))),
    ]);
  });

  it('parses <u>underline with **bold** inside</u>', () => {
    expect(parseObsidianInline('<u>underline with **bold** inside</u>')).toEqual([
      underline(text('underline with '), bold(text('bold')), text(' inside')),
    ]);
  });

  it('parses <u>underline with _italic_ inside</u>', () => {
    expect(parseObsidianInline('<u>underline with _italic_ inside</u>')).toEqual([
      underline(text('underline with '), italic(text('italic')), text(' inside')),
    ]);
  });

  it('parses **_bold italic combined_**', () => {
    expect(parseObsidianInline('**_bold italic combined_**')).toEqual([
      bold(italic(text('bold italic combined'))),
    ]);
  });

  it('parses **<u>bold underline</u>**', () => {
    expect(parseObsidianInline('**<u>bold underline</u>**')).toEqual([
      bold(underline(text('bold underline'))),
    ]);
  });

  it('parses _<u>italic underline</u>_', () => {
    expect(parseObsidianInline('_<u>italic underline</u>_')).toEqual([
      italic(underline(text('italic underline'))),
    ]);
  });

  it('parses multiple spans on the same line', () => {
    expect(
      parseObsidianInline('**bold** then _italic_ then <u>underline</u> in same line'),
    ).toEqual([
      bold(text('bold')),
      text(' then '),
      italic(text('italic')),
      text(' then '),
      underline(text('underline')),
      text(' in same line'),
    ]);
  });

  it('parses mixed formatting with surrounding text', () => {
    expect(
      parseObsidianInline('Text with **bold**, _italic_, and <u>underline</u> mixed together'),
    ).toEqual([
      text('Text with '),
      bold(text('bold')),
      text(', '),
      italic(text('italic')),
      text(', and '),
      underline(text('underline')),
      text(' mixed together'),
    ]);
  });

  it('passes through unrecognised syntax as text', () => {
    expect(parseObsidianInline('~~strikethrough is preserved as-is~~')).toEqual([
      text('~~strikethrough is preserved as-is~~'),
    ]);
  });

  it('treats unclosed bold delimiter as plain text', () => {
    const result = parseObsidianInline('**unclosed');
    expect(serializeObsidianInline(result)).toBe('**unclosed');
  });
});

// ---------------------------------------------------------------------------
// parseTiddlywikiInline
// ---------------------------------------------------------------------------

describe('parseTiddlywikiInline', () => {
  it('parses plain text as a single text token', () => {
    expect(parseTiddlywikiInline('hello world')).toEqual([text('hello world')]);
  });

  it("parses ''bold''", () => {
    expect(parseTiddlywikiInline("''bold text''")).toEqual([bold(text('bold text'))]);
  });

  it('parses //italic//', () => {
    expect(parseTiddlywikiInline('//italic text//')).toEqual([italic(text('italic text'))]);
  });

  it('parses __underline__', () => {
    expect(parseTiddlywikiInline('__underlined text__')).toEqual([
      underline(text('underlined text')),
    ]);
  });

  it('parses `inline code`', () => {
    expect(parseTiddlywikiInline('Inline `code` is preserved')).toEqual([
      text('Inline '),
      code('code'),
      text(' is preserved'),
    ]);
  });

  it("parses ''bold with //italic inside//''", () => {
    expect(parseTiddlywikiInline("''bold with //italic inside//''"   )).toEqual([
      bold(text('bold with '), italic(text('italic inside'))),
    ]);
  });

  it("parses //italic with ''bold inside''//", () => {
    expect(parseTiddlywikiInline("//italic with ''bold inside''//" )).toEqual([
      italic(text('italic with '), bold(text('bold inside'))),
    ]);
  });

  it("parses __underline with ''bold'' inside__", () => {
    expect(parseTiddlywikiInline("__underline with ''bold'' inside__")).toEqual([
      underline(text('underline with '), bold(text('bold')), text(' inside')),
    ]);
  });

  it('parses __underline with //italic// inside__', () => {
    expect(parseTiddlywikiInline('__underline with //italic// inside__')).toEqual([
      underline(text('underline with '), italic(text('italic')), text(' inside')),
    ]);
  });

  it("parses ''//bold italic combined//''", () => {
    expect(parseTiddlywikiInline("''//bold italic combined//''"  )).toEqual([
      bold(italic(text('bold italic combined'))),
    ]);
  });

  it("parses ''__bold underline__''", () => {
    expect(parseTiddlywikiInline("''__bold underline__''"  )).toEqual([
      bold(underline(text('bold underline'))),
    ]);
  });

  it('parses //__italic underline__//', () => {
    expect(parseTiddlywikiInline('//__italic underline__//')).toEqual([
      italic(underline(text('italic underline'))),
    ]);
  });

  it('parses multiple spans on the same line', () => {
    expect(
      parseTiddlywikiInline("''bold'' then //italic// then __underline__ in same line"),
    ).toEqual([
      bold(text('bold')),
      text(' then '),
      italic(text('italic')),
      text(' then '),
      underline(text('underline')),
      text(' in same line'),
    ]);
  });

  it('passes through unrecognised syntax as text', () => {
    expect(parseTiddlywikiInline('~~strikethrough is preserved as-is~~')).toEqual([
      text('~~strikethrough is preserved as-is~~'),
    ]);
  });
});

// ---------------------------------------------------------------------------
// serializeObsidianInline
// ---------------------------------------------------------------------------

describe('serializeObsidianInline', () => {
  it('serialises text token', () => {
    expect(serializeObsidianInline([text('hello')])).toBe('hello');
  });

  it('serialises bold', () => {
    expect(serializeObsidianInline([bold(text('hi'))])).toBe('**hi**');
  });

  it('serialises italic', () => {
    expect(serializeObsidianInline([italic(text('hi'))])).toBe('_hi_');
  });

  it('serialises underline', () => {
    expect(serializeObsidianInline([underline(text('hi'))])).toBe('<u>hi</u>');
  });

  it('serialises inline code', () => {
    expect(serializeObsidianInline([code('x')])).toBe('`x`');
  });

  it('serialises nested bold > italic', () => {
    expect(serializeObsidianInline([bold(italic(text('bi')))])).toBe('**_bi_**');
  });
});

// ---------------------------------------------------------------------------
// serializeTiddlywikiInline
// ---------------------------------------------------------------------------

describe('serializeTiddlywikiInline', () => {
  it('serialises text token', () => {
    expect(serializeTiddlywikiInline([text('hello')])).toBe('hello');
  });

  it('serialises bold', () => {
    expect(serializeTiddlywikiInline([bold(text('hi'))])).toBe("''hi''");
  });

  it('serialises italic', () => {
    expect(serializeTiddlywikiInline([italic(text('hi'))])).toBe('//hi//');
  });

  it('serialises underline', () => {
    expect(serializeTiddlywikiInline([underline(text('hi'))])).toBe('__hi__');
  });

  it('serialises inline code', () => {
    expect(serializeTiddlywikiInline([code('x')])).toBe('`x`');
  });

  it('serialises nested bold > italic', () => {
    expect(serializeTiddlywikiInline([bold(italic(text('bi')))])).toBe("''//bi//''");
  });
});

// ---------------------------------------------------------------------------
// Round-trip: each line of 02-inline-formatting.md ↔ 02-inline-formatting.tid
// ---------------------------------------------------------------------------

const obsidianLines = [
  '**bold text**',
  '_italic text_',
  '<u>underlined text</u>',
  '**bold with _italic inside_**',
  '_italic with **bold inside**_',
  '<u>underline with **bold** inside</u>',
  '<u>underline with _italic_ inside</u>',
  '**_bold italic combined_**',
  '**<u>bold underline</u>**',
  '_<u>italic underline</u>_',
  '**bold** then _italic_ then <u>underline</u> in same line',
  'Inline `code` is preserved',
  'Text with **bold**, _italic_, and <u>underline</u> mixed together',
  '~~strikethrough is preserved as-is~~',
];

const tiddlywikiLines = [
  "''bold text''",
  '//italic text//',
  '__underlined text__',
  "''bold with //italic inside//''",
  "//italic with ''bold inside''//",
  "__underline with ''bold'' inside__",
  '__underline with //italic// inside__',
  "''//bold italic combined//''",
  "''__bold underline__''",
  '//__italic underline__//',
  "''bold'' then //italic// then __underline__ in same line",
  'Inline `code` is preserved',
  "Text with ''bold'', //italic//, and __underline__ mixed together",
  '~~strikethrough is preserved as-is~~',
];

describe('round-trip: Obsidian inline → TiddlyWiki inline', () => {
  it.each(obsidianLines.map((obs, i) => [obs, tiddlywikiLines[i]]))(
    'converts "%s"',
    (obsidian, expected) => {
      const tokens = parseObsidianInline(obsidian);
      expect(serializeTiddlywikiInline(tokens)).toBe(expected);
    },
  );
});

describe('round-trip: TiddlyWiki inline → Obsidian inline', () => {
  it.each(tiddlywikiLines.map((tid, i) => [tid, obsidianLines[i]]))(
    'converts "%s"',
    (tiddlywiki, expected) => {
      const tokens = parseTiddlywikiInline(tiddlywiki);
      expect(serializeObsidianInline(tokens)).toBe(expected);
    },
  );
});

// ---------------------------------------------------------------------------
// Full document round-trips using block lexers
// ---------------------------------------------------------------------------

describe('full document round-trip: Obsidian → TiddlyWiki', () => {
  it('converts 02-inline-formatting.md to 02-inline-formatting.tid', () => {
    const obsidian = obsidianLines.join('\n\n');
    const expected = tiddlywikiLines.join('\n\n');
    expect(serializeTiddlywiki(lexObsidian(obsidian))).toBe(expected);
  });
});

describe('full document round-trip: TiddlyWiki → Obsidian', () => {
  it('converts 02-inline-formatting.tid to 02-inline-formatting.md', () => {
    const tiddlywiki = tiddlywikiLines.join('\n\n');
    const expected = obsidianLines.join('\n\n');
    expect(serializeObsidian(lexTiddlywiki(tiddlywiki))).toBe(expected);
  });
});

describe('symmetric round-trip: inline formatting', () => {
  it('Obsidian → TiddlyWiki → Obsidian preserves each line', () => {
    for (const line of obsidianLines) {
      const result = serializeObsidianInline(parseTiddlywikiInline(serializeTiddlywikiInline(parseObsidianInline(line))));
      expect(result).toBe(line);
    }
  });

  it('TiddlyWiki → Obsidian → TiddlyWiki preserves each line', () => {
    for (const line of tiddlywikiLines) {
      const result = serializeTiddlywikiInline(parseObsidianInline(serializeObsidianInline(parseTiddlywikiInline(line))));
      expect(result).toBe(line);
    }
  });
});
