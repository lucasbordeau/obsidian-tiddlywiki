import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';
import { quoteTiddlyWikiAttribute } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/quoteTiddlyWikiAttribute';

export function serializeTiddlyWikiHtmlList(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'list' }>,
): string {
  const tag = block.ordered ? 'ol' : 'ul';

  const startAttribute =
    block.ordered && block.start !== 1 ? ` start="${block.start}"` : '';

  const serializedListItems = block.children.map((listItem) => {
    const marker =
      listItem.taskMarker === undefined
        ? ''
        : ' data-task-marker=' + quoteTiddlyWikiAttribute(listItem.taskMarker);

    const checkbox =
      listItem.checked === undefined
        ? ''
        : `<input type="checkbox" disabled${listItem.checked ? ' checked' : ''}${marker}/> `;

    return (
      '<li>\n\n' +
      checkbox +
      this.serializeBlocks(listItem.blocks) +
      '\n\n</li>'
    );
  });

  return (
    `<${tag}${startAttribute}>\n\n` +
    serializedListItems.join('\n\n') +
    `\n\n</${tag}>`
  );
}
