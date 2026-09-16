import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { stripSourceRanges as semanticBlocks } from '@/testing/support/ast/stripSourceRanges';

describe('Obsidian documented extensions and structural regressions', () => {
  test.each(['query', 'base', 'mermaid'])(
    'protects %s fence bodies from all extension rules',
    (language) => {
      const value =
        '[^n]: fake\n  continuation\n- [?] task\n![](https://youtu.be/video)\n^[inline] ==highlight== %%comment%%\n[[Note|alias]] **bold**\n```\n';

      const source = `\`\`\`\`${language}\n${value}\n\`\`\`\``;

      const document = parseObsidian(source);

      expect(semanticBlocks(document.blocks)).toEqual([
        { type: 'code', language, value },
      ]);

      expect(document.diagnostics).toEqual([]);

      const converted = convertText(source, 'obsidian', 'tiddlywiki');

      const restored = convertText(converted.text, 'tiddlywiki', 'obsidian');

      expect(semanticBlocks(parseObsidian(restored.text).blocks)).toEqual(
        semanticBlocks(document.blocks),
      );
    },
  );
});
