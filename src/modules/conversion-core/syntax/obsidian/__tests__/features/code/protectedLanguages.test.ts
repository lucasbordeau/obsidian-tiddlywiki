import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { assertStableRoundTrip } from '@/testing/support/assertStableRoundTrip';
import { pluginFenceBodies } from '@/modules/conversion-core/syntax/obsidian/__tests__/features/code/pluginFenceBodies';

describe('official Obsidian feature inventory', () => {
  test.each(pluginFenceBodies)(
    'O-FENCED: %s retains literal code and language through three cycles',
    (language, literal) => {
      const source = `\`\`\`\`\`${language}\n${literal}\n\`\`\`\`\``;

      expect(parseObsidian(source).blocks).toEqual([
        expect.objectContaining({ type: 'code', language, value: literal }),
      ]);

      const restored = assertStableRoundTrip(source);

      expect(parseObsidian(restored).blocks[0]).toMatchObject({
        type: 'code',
        language,
        value: literal,
      });
    },
  );
});
