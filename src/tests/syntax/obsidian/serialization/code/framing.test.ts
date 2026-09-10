import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { ParsedDocument } from '../../../../../modules/conversion-core/model/ast/documents/ParsedDocument';
import { blocksOf } from '../../../../support/syntax/obsidian/blocksOf';
import { fencedCodeValues } from './cases/fencedCodeValues';
import { tableCodeValues } from './cases/tableCodeValues';
import { inlineCodeValues } from './cases/inlineCodeValues';

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

      expect(blocksOf(emitted.text)).toEqual(document.blocks);

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

      expect(blocksOf(serializeObsidian(document).text)).toEqual(
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

      expect(blocksOf(serializeObsidian(document).text)).toEqual(
        document.blocks,
      );
    },
  );
});
