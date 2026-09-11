import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { SerializationContext } from '../../types/SerializationContext';
import { renderInlines } from '../inlines/renderInlines';
import { renderCode } from './renderCode';
import { renderList } from './renderList';
import { renderTable } from './renderTable';
import { emitRaw } from '../emitRaw';
import { escapeText } from '../escaping/escapeText';

export function renderBlock(
  block: BlockNode,
  context: SerializationContext,
): string {
  switch (block.type) {
    case 'paragraph':
      return renderInlines(block.children, context);
    case 'heading':
      return `${'#'.repeat(Math.min(6, Math.max(1, block.level)))} ${renderInlines(block.children, context)}`;
    case 'code':
      return renderCode(block);
    case 'thematicBreak':
      return '***';
    case 'list':
      return renderList(block, context);
    case 'table':
      return renderTable(block, context);
    case 'math':
      return `$$\n${block.value}\n$$`;
    case 'raw':
      return emitRaw(block, context);
    case 'quote': {
      let content = context.renderBlocks(block.children);

      if (block.callout) {
        const titleContent = block.callout.titleNodes
          ? renderInlines(block.callout.titleNodes, context)
          : escapeText(block.callout.title);

        const title = `[!${block.callout.type}]${block.callout.fold ?? ''}${titleContent ? ` ${titleContent}` : ''}`;

        content = `${title}${content ? `\n${content}` : ''}`;
      }

      return content
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');
    }

    case 'footnoteDefinition': {
      const lines = context.renderBlocks(block.children).split('\n');

      return `[^${block.identifier}]: ${lines[0]}${lines
        .slice(1)
        .map((line) => `\n${line ? `    ${line}` : ''}`)
        .join('')}`;
    }
  }
}
