import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { parseObsidianBlocks } from '@/tests/support/parseObsidianBlocks';
import { stripSourceRanges as semanticBlocks } from '@/tests/support/ast/stripSourceRanges';

describe('Obsidian structural parsing', () => {
  test('does not apply markdown formatting inside raw HTML or comments', () => {
    const blocks = parseObsidianBlocks(
      '<u>**literal** &amp; _also literal_</u> %%**hidden** [[hidden]]%%\n\n<div>\n[[raw]] **raw**\n</div>',
    );

    expect(blocks).toMatchObject([
      {
        type: 'paragraph',
        children: [
          {
            type: 'underline',
            children: [{ type: 'text', value: '**literal** & _also literal_' }],
          },
          { type: 'text', value: ' ' },
          {
            type: 'raw',
            value: '%%**hidden** [[hidden]]%%',
            dialect: 'obsidian',
          },
        ],
      },
      {
        type: 'raw',
        dialect: 'obsidian',
        value: '<div>\n[[raw]] **raw**\n</div>',
      },
    ]);
  });

  test('treats nested static HTML as HTML semantics and keeps unsupported attributes as raw source', () => {
    const source =
      '<u>**literal** <strong>bold <em>and italic</em></strong> <code>\\*literal* &lt;x&gt;</code></u> <sup><a href="Folder/Note" title="Tooltip"><strong>link</strong></a></sup> <img src="image.png" onerror="danger()">';

    const document = parseObsidian(source);

    expect(document.blocks[0]).toMatchObject({
      children: [
        {
          type: 'underline',
          children: [
            { type: 'text', value: '**literal** ' },
            {
              type: 'strong',
              children: [
                { type: 'text', value: 'bold ' },
                {
                  type: 'emphasis',
                  children: [{ type: 'text', value: 'and italic' }],
                },
              ],
            },
            { type: 'text', value: ' ' },
            { type: 'code', value: '\\*literal* <x>' },
          ],
        },
        { type: 'text', value: ' ' },
        {
          type: 'superscript',
          children: [
            {
              type: 'link',
              target: 'Folder/Note',
              title: 'Tooltip',
              label: [{ type: 'strong' }],
            },
          ],
        },
        { type: 'text', value: ' ' },
        {
          type: 'raw',
          value: '<img src="image.png" onerror="danger()">',
          dialect: 'obsidian',
        },
      ],
    });

    expect(
      semanticBlocks(parseObsidian(serializeObsidian(document).text).blocks),
    ).toEqual(semanticBlocks(document.blocks));
  });
});
