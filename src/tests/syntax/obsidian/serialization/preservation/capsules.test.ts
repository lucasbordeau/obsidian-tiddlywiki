import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { encodePreservedSource } from '../../../../../modules/conversion-core/preservation/source/encoding/encodePreservedSource';
import { ParsedDocument } from '../../../../../modules/conversion-core/model/ast/documents/ParsedDocument';
import { blocksOf } from '../../../../support/syntax/obsidian/blocksOf';
import { readMarkdownSample as fixture } from '../../../../support/samples/readMarkdownSample';

describe('Obsidian semantic serialization', () => {
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
});
