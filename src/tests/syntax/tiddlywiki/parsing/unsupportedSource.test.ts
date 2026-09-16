import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { encodePreservedSource } from '@/modules/conversion-core/preservation/source/encodePreservedSource';
import { dynamicSourceSamples } from '@/tests/syntax/tiddlywiki/parsing/dynamicSourceSamples';
import { unfinishedSourceSamples } from '@/tests/syntax/tiddlywiki/parsing/unfinishedSourceSamples';

describe('TiddlyWiki structural parsing and serialization', () => {
  test.each(dynamicSourceSamples)(
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

  test.each(unfinishedSourceSamples)(
    'unfinished editor input stays covered and diagnosed: %s',
    (source) => {
      const document = parseTiddlyWiki(source);

      expect(document.tokens.map((token) => token.raw).join('')).toBe(source);
      expect(document.diagnostics.length).toBeGreaterThan(0);
    },
  );

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
});
