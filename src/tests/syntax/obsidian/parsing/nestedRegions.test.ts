import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { stripSourceRanges as semanticBlocks } from '@/tests/support/ast/stripSourceRanges';

describe('Obsidian structural parsing', () => {
  test('keeps literal raw regions inside quoted lists at the correct nesting depth', () => {
    const source =
      '> - First\n>\n>   <div class="custom">\n>   **literal**\n>   </div>\n>\n> - Last\n\n> %%a comment\n>\n> with a blank line%%';

    const document = parseObsidian(source);

    const emitted = serializeObsidian(document);

    expect(semanticBlocks(parseObsidian(emitted.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );

    expect(emitted.text).not.toContain('>   >');
  });

  test('preserves raw content inside footnotes without inventing nested source ranges', () => {
    const source =
      '[^n]: A definition\n\n    <div class="custom">\n    **literal**\n    </div>';

    const document = parseObsidian(source);

    expect(document.blocks[0]).toMatchObject({
      type: 'footnoteDefinition',
      children: [
        { type: 'paragraph' },
        { type: 'raw', value: '<div class="custom">\n**literal**\n</div>' },
      ],
    });

    expect(
      semanticBlocks(parseObsidian(serializeObsidian(document).text).blocks),
    ).toEqual(semanticBlocks(document.blocks));
  });
});
