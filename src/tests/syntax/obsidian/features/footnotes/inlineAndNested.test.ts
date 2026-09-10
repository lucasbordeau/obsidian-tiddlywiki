import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { convertText } from '../../../../../modules/conversion-core/conversion/convertText';
import { stripSourceRanges as semanticBlocks } from '../../../../support/ast/comparison/stripSourceRanges';

describe('Obsidian documented extensions and structural regressions', () => {
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
});
