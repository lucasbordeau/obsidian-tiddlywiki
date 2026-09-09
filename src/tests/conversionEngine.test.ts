import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { convertText } from '../modules/conversion-core/convertText';
import { parseObsidian } from '../modules/conversion-core/markdown/parseObsidian';
import { parseTiddlyWiki } from '../modules/conversion-core/tiddlywiki/parseTiddlyWiki';
import { Dialect } from '../modules/conversion-core/types/Dialect';
import { semanticBlocks } from './utils/semanticBlocks';
import { renderTiddlyWiki } from './utils/renderTiddlyWiki';

const fixture = (name: string) =>
  readFileSync(join(__dirname, 'samples/conversion-core', name), 'utf8');

describe('cross-dialect conversion', () => {
  describe.each<Dialect>(['obsidian', 'tiddlywiki'])(
    'existing %s sample corpus',
    (dialect) => {
      const directory = join(__dirname, 'samples', dialect);
      const filenames = readdirSync(directory).sort();
      test.each(filenames)(
        '%s keeps its parsed meaning through both conversion directions',
        (filename) => {
          const source = readFileSync(join(directory, filename), 'utf8');
          const target = dialect === 'obsidian' ? 'tiddlywiki' : 'obsidian';
          const parser =
            dialect === 'obsidian' ? parseObsidian : parseTiddlyWiki;
          const converted = convertText(source, dialect, target);
          const restored = convertText(converted.text, target, dialect);
          expect(semanticBlocks(parser(restored.text).blocks)).toEqual(
            semanticBlocks(parser(source).blocks),
          );
        },
      );
    },
  );

  test.each<Dialect>(['obsidian', 'tiddlywiki'])(
    '%s: compound document preserves semantics over four cycles',
    (dialect) => {
      const original = fixture(
        dialect === 'obsidian' ? 'roundtrip-lab.md' : 'roundtrip-lab.tid',
      );
      const parser = dialect === 'obsidian' ? parseObsidian : parseTiddlyWiki;
      const target = dialect === 'obsidian' ? 'tiddlywiki' : 'obsidian';
      const expected = semanticBlocks(parser(original).blocks);
      let source = original;
      for (let cycle = 0; cycle < 4; cycle++) {
        const outgoing = convertText(source, dialect, target);
        const incoming = convertText(outgoing.text, target, dialect);
        expect(semanticBlocks(parser(incoming.text).blocks)).toEqual(expected);
        source = incoming.text;
      }
    },
  );

  test('real TW rendering retains nested hierarchy, labels, external URLs and literal code', async () => {
    const source =
      '# Head\n\n- **outer _inner_**\n  1. ordered\n     - deep\n\n[remote](https://example.org/a_(b))\n\n```text\n**literal** [[literal]]\n```';
    const converted = convertText(source, 'obsidian', 'tiddlywiki');
    const html = await renderTiddlyWiki(converted.text);
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>outer <em>inner</em></strong>');
    expect(html).toMatch(
      /<ul><li>[\s\S]*<ol><li>ordered<ul><li>deep<\/li><\/ul><\/li><\/ol>/,
    );
    expect(html).toContain('href="https://example.org/a_(b)"');
    expect(html).toContain('**literal** [[literal]]');
  });

  test('a resolver changes only internal identities and preserves labels and external image URLs', () => {
    const resolveLink = jest.fn((target: string) => `mapped/${target}`);
    const source =
      '[[Folder/A#Part|label]] ![[assets/a.svg|100]] [outside](https://example.org) ![remote](https://example.org/a.png)';
    const converted = convertText(source, 'obsidian', 'tiddlywiki', {
      resolveLink,
    });
    expect(converted.text).toContain('mapped/Folder/A#Part');
    expect(converted.text).toContain('mapped/assets/a.svg');
    expect(converted.text).toContain('label');
    expect(resolveLink.mock.calls.map((call) => call[0])).toEqual([
      'Folder/A#Part',
      'assets/a.svg',
    ]);
  });

  test.each([
    '$x_1 + \\frac{a}{b}$ and ![[Note#^block]]',
    '> [!warning]- **Rich title**\n> Literal `[[x]]` and **body**.',
    'Before %% [[hidden]] **hidden** %% after.',
  ])(
    'unsupported Obsidian constructs recover source without serializing AST JSON: %s',
    (source) => {
      const outgoing = convertText(source, 'obsidian', 'tiddlywiki');
      const incoming = convertText(outgoing.text, 'tiddlywiki', 'obsidian');
      expect(semanticBlocks(parseObsidian(incoming.text).blocks)).toEqual(
        semanticBlocks(parseObsidian(source).blocks),
      );
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

  test.each<Dialect>(['obsidian', 'tiddlywiki'])(
    '%s: same-dialect conversion leaves source byte-for-byte intact',
    (dialect) => {
      const source = '\r\n🙂 malformed [[\n\n   odd spacing\r\n';
      expect(convertText(source, dialect, dialect).text).toBe(source);
    },
  );
});
