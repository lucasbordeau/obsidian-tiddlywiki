import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { blocksOf } from '../../../../support/syntax/obsidian/blocksOf';

describe('Obsidian structural parsing', () => {
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
});
