import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { stableRoundTrip } from '../../../../support/conversion/stableRoundTrip';
import { pluginFenceBodies } from './cases/pluginFenceBodies';

describe('official Obsidian feature inventory', () => {
  test.each(pluginFenceBodies)(
    'O-FENCED: %s retains literal code and language through three cycles',
    (language, literal) => {
      const source = `\`\`\`\`\`${language}\n${literal}\n\`\`\`\`\``;

      expect(parseObsidian(source).blocks).toEqual([
        expect.objectContaining({ type: 'code', language, value: literal }),
      ]);

      const restored = stableRoundTrip(source);

      expect(parseObsidian(restored).blocks[0]).toMatchObject({
        type: 'code',
        language,
        value: literal,
      });
    },
  );
});
