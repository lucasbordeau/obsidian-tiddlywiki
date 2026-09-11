import type { Token } from '../../types/Token';
import type { TokenCursor } from '../../types/TokenCursor';
import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { collectInlineChildren } from '../inlines/collectInlineChildren';

export function parseTable(tokens: Token[], cursor: TokenCursor): BlockNode {
  const header: InlineNode[][] = [];
  const tableRows: InlineNode[][][] = [];
  const alignments: ('left' | 'right' | 'center' | null)[] = [];
  let currentCells: InlineNode[][] = [];
  let inHeader = false;

  while (cursor.position < tokens.length) {
    const token = tokens[cursor.position++];

    if (token.type === 'table_close') {
      break;
    }

    if (token.type === 'thead_open') {
      inHeader = true;
    }

    if (token.type === 'thead_close') {
      inHeader = false;
    }

    if (token.type === 'tr_open') {
      currentCells = [];
    }

    const cellOpening = token.type === 'th_open' || token.type === 'td_open';

    if (cellOpening) {
      currentCells.push(collectInlineChildren(tokens[cursor.position++]));

      if (inHeader) {
        const alignment = /text-align:(left|right|center)/.exec(
          token.attrGet('style') ?? '',
        );

        alignments.push(
          alignment ? (alignment[1] as 'left' | 'right' | 'center') : null,
        );
      }
    }

    if (token.type === 'tr_close') {
      if (inHeader) {
        header.push(...currentCells);
      } else {
        tableRows.push(currentCells);
      }
    }
  }

  return { type: 'table', header, rows: tableRows, alignments };
}
