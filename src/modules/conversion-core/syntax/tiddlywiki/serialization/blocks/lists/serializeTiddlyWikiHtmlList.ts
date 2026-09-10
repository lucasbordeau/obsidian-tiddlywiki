import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../../context/types/TiddlyWikiSerializationContext';
import { quoteTiddlyWikiAttribute } from '../../escaping/quoteTiddlyWikiAttribute';

export function serializeTiddlyWikiHtmlList(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'list' }>,
): string {
  const tag = block.ordered ? 'ol' : 'ul';

  const startAttribute =
    block.ordered && block.start !== 1 ? ` start="${block.start}"` : '';

  const entries = block.children.map((entry) => {
    const marker =
      entry.taskMarker === undefined
        ? ''
        : ' data-task-marker=' + quoteTiddlyWikiAttribute(entry.taskMarker);

    const checkbox =
      entry.checked === undefined
        ? ''
        : `<input type="checkbox" disabled${entry.checked ? ' checked' : ''}${marker}/> `;

    return (
      '<li>\n\n' + checkbox + this.serializeBlocks(entry.blocks) + '\n\n</li>'
    );
  });

  return (
    `<${tag}${startAttribute}>\n\n` + entries.join('\n\n') + `\n\n</${tag}>`
  );
}
