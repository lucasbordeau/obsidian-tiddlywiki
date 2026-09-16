import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { normalizeSemanticBlocks } from '@/tests/support/ast/normalizeSemanticBlocks';

describe('cross-dialect conversion', () => {
  test.each([
    '$x_1 + \\frac{a}{b}$ and ![[Note#^block]]',
    '> [!warning]- **Rich title**\n> Literal `[[x]]` and **body**.',
    'Before %% [[hidden]] **hidden** %% after.',
  ])(
    'unsupported Obsidian constructs recover source without serializing AST JSON: %s',
    (source) => {
      const outgoing = convertText(source, 'obsidian', 'tiddlywiki');

      const incoming = convertText(outgoing.text, 'tiddlywiki', 'obsidian');

      expect(
        normalizeSemanticBlocks(parseObsidian(incoming.text).blocks),
      ).toEqual(normalizeSemanticBlocks(parseObsidian(source).blocks));

      expect(incoming.text).not.toContain('"type":"');
    },
  );

  test('dynamic TW syntax remains inert and recoverable through a Markdown edit nearby', () => {
    const widget =
      '<$list filter="[tag[Example]]"><$text text="[[literal]]"/></$list>';

    const source = `! Heading\n\nBefore ${widget} after.`;

    const outgoing = convertText(source, 'tiddlywiki', 'obsidian');

    expect(outgoing.diagnostics.length).toBeGreaterThan(0);
    expect(outgoing.text).not.toContain('<$list');

    const incoming = convertText(
      outgoing.text.replace('Heading', 'Edited heading'),
      'obsidian',
      'tiddlywiki',
    );

    expect(incoming.text).toContain(widget);
    expect(incoming.text).toContain('Edited heading');
  });
});
