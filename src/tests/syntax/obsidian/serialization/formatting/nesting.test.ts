import { serializeObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { ParsedDocument } from '../../../../../modules/conversion-core/model/ast/documents/ParsedDocument';
import { InlineNode } from '../../../../../modules/conversion-core/model/ast/inlines/InlineNode';
import { blocksOf } from '../../../../support/syntax/obsidian/blocksOf';
import { formatOrders } from './cases/formatOrders';

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

      expect(blocksOf(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );
});
