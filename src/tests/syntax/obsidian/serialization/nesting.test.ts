import { serializeObsidian } from '../../../../modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { ParsedDocument } from '../../../../modules/conversion-core/model/ParsedDocument';
import { InlineNode } from '../../../../modules/conversion-core/model/inlines/InlineNode';
import { parseObsidianBlocks } from '../../../support/parseObsidianBlocks';
import { formatOrders } from './formatOrders';

describe('Obsidian documented extensions and structural regressions', () => {
  test.each(formatOrders.map((order) => [order.join('/'), order] as const))(
    'retains format nesting order and intraword adjacency: %s',
    (_, order) => {
      let formatted: InlineNode = { type: 'text', value: 'inside' };

      for (const type of order) {
        formatted = { type, children: [formatted] };
      }

      const document: ParsedDocument = {
        dialect: 'tiddlywiki',
        source: '',
        tokens: [],
        diagnostics: [],
        blocks: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', value: 'prefix' },
              formatted,
              { type: 'text', value: 'suffix' },
            ],
          },
        ],
      };

      expect(parseObsidianBlocks(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );
});
