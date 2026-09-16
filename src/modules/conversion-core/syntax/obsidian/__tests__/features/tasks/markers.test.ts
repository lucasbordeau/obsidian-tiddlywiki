import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { normalizeSemanticBlocks as normalizedSemanticBlocks } from '@/testing/support/ast/normalizeSemanticBlocks';
import { completedTaskMarkers } from '@/modules/conversion-core/syntax/obsidian/__tests__/features/tasks/completedTaskMarkers';

describe('Obsidian documented extensions and structural regressions', () => {
  test.each(completedTaskMarkers)(
    'retains completed task marker %s through nested lists and both dialects',
    (marker) => {
      const source = `> [!todo] Queue\n> - [${marker}] **Task** [^n]\n>   3. [ ] next\n>\n> [^n]: note\n>   continued`;

      const document = parseObsidian(source);

      expect(document.blocks[0]).toMatchObject({
        type: 'quote',
        children: expect.arrayContaining([
          expect.objectContaining({
            type: 'list',
            children: [expect.objectContaining({ checked: true })],
          }),
        ]),
      });

      const expected = normalizedSemanticBlocks(document.blocks);

      const converted = convertText(source, 'obsidian', 'tiddlywiki');

      const restored = convertText(converted.text, 'tiddlywiki', 'obsidian');

      expect(
        normalizedSemanticBlocks(parseObsidian(restored.text).blocks),
      ).toEqual(expected);

      expect(restored.text).toContain(`[${marker}]`);
    },
  );

  test('recognizes task markers before reference link resolution and preserves the actual body link', () => {
    const document = parseObsidian(
      '- [x] [documentation][x]\n\n[x]: https://example.org/help',
    );

    expect(document.blocks[0]).toMatchObject({
      type: 'list',
      children: [
        {
          checked: true,
          blocks: [
            {
              children: [
                {
                  type: 'link',
                  target: 'https://example.org/help',
                  label: [{ value: 'documentation' }],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
