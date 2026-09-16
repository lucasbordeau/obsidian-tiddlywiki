import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { collectAllInlines } from '@/tests/support/ast/collectAllInlines';
import { assertStableRoundTrip } from '@/tests/support/assertStableRoundTrip';
import { attachmentExtensions } from '@/tests/syntax/obsidian/features/attachments/attachmentExtensions';
import { embeddedSectionTargets } from '@/tests/syntax/obsidian/features/attachments/embeddedSectionTargets';

describe('official Obsidian feature inventory', () => {
  test.each(attachmentExtensions)(
    'O-FILE: .%s attachments retain their exact target in embeds and links',
    (extension) => {
      const target = `Attachments/été report (v2).${extension}`;
      const source = `[[${target}|Download **literal alias**]]\n\n> [!example]- Preview\n> ![[${target}]]\n>\n> - [x] File is linked`;

      const references = collectAllInlines(parseObsidian(source).blocks).filter(
        (node) => node.type === 'link' || node.type === 'embed',
      );

      expect(references).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'link', target }),
          expect.objectContaining({
            type: 'embed',
            kind: 'transclusion',
            target,
          }),
        ]),
      );

      assertStableRoundTrip(source);
    },
  );

  test.each(embeddedSectionTargets)(
    'O-ANCHOR-EMBED: host-specific fragment %s is recoverable and diagnosed',
    (target) => {
      const source = `Before ![[${target}]] and **after**.`;

      const outgoing = convertText(source, 'obsidian', 'tiddlywiki');

      expect(outgoing.diagnostics.length).toBeGreaterThan(0);
      expect(assertStableRoundTrip(source)).toContain(target);
    },
  );
});
