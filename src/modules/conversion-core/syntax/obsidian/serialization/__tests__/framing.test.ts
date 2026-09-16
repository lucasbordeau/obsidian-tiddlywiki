import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { parseObsidianBlocks } from '@/testing/support/parseObsidianBlocks';
import { fencedCodeValues } from '@/modules/conversion-core/syntax/obsidian/serialization/__tests__/fencedCodeValues';
import { tableCodeValues } from '@/modules/conversion-core/syntax/obsidian/serialization/__tests__/tableCodeValues';
import { inlineCodeValues } from '@/modules/conversion-core/syntax/obsidian/serialization/__tests__/inlineCodeValues';

describe('Obsidian semantic serialization', () => {
  test.each(fencedCodeValues)(
    'preserves intentional trailing blank lines in code AST: %j',
    (value) => {
      const document: ParsedDocument = {
        dialect: 'obsidian',
        source: '',
        blocks: [{ type: 'code', language: 'text', value }],
        tokens: [],
        diagnostics: [],
      };

      const emitted = serializeObsidian(document);

      expect(parseObsidianBlocks(emitted.text)).toEqual(document.blocks);

      expect(serializeObsidian(parseObsidian(emitted.text)).text).toBe(
        emitted.text,
      );
    },
  );

  test.each(tableCodeValues)(
    'retains pipes and backslashes in code within tables: %j',
    (value) => {
      const document: ParsedDocument = {
        dialect: 'obsidian',
        source: '',
        blocks: [
          {
            type: 'table',
            header: [[{ type: 'text', value: 'Code' }]],
            alignments: [null],
            rows: [[[{ type: 'code', value }]]],
          },
        ],
        tokens: [],
        diagnostics: [],
      };

      expect(parseObsidianBlocks(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );

  test.each(inlineCodeValues)(
    'preserves code span literal framing: %j',
    (value) => {
      const document: ParsedDocument = {
        dialect: 'obsidian',
        source: '',
        blocks: [{ type: 'paragraph', children: [{ type: 'code', value }] }],
        tokens: [],
        diagnostics: [],
      };

      expect(parseObsidianBlocks(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );
});
