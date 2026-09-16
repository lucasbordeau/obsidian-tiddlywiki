import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { Dialect } from '@/modules/conversion-core/model/Dialect';
import { normalizeSemanticBlocks } from '@/testing/support/ast/normalizeSemanticBlocks';
import { readConversionSample as fixture } from '@/testing/support/samples/readConversionSample';

describe('cross-dialect conversion', () => {
  test.each<Dialect>(['obsidian', 'tiddlywiki'])(
    '%s: compound document preserves semantics over four cycles',
    (dialect) => {
      const original = fixture(
        dialect === 'obsidian' ? 'roundtrip-lab.md' : 'roundtrip-lab.tid',
      );

      const parser = dialect === 'obsidian' ? parseObsidian : parseTiddlyWiki;
      const target = dialect === 'obsidian' ? 'tiddlywiki' : 'obsidian';
      const expected = normalizeSemanticBlocks(parser(original).blocks);

      let source = original;

      for (let cycle = 0; cycle < 4; cycle++) {
        const outgoing = convertText(source, dialect, target);
        const incoming = convertText(outgoing.text, target, dialect);

        expect(normalizeSemanticBlocks(parser(incoming.text).blocks)).toEqual(
          expected,
        );

        source = incoming.text;
      }
    },
  );

  test.each<Dialect>(['obsidian', 'tiddlywiki'])(
    '%s: same-dialect conversion leaves source byte-for-byte intact',
    (dialect) => {
      const source = '\r\n🙂 malformed [[\n\n   odd spacing\r\n';

      expect(convertText(source, dialect, dialect).text).toBe(source);
    },
  );
});
