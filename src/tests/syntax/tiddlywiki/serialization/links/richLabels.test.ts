import { parseTiddlyWiki } from '../../../../../modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '../../../../../modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { InlineNode } from '../../../../../modules/conversion-core/model/ast/inlines/InlineNode';
import { semanticBlocks } from '../../../../support/ast/comparison/semanticBlocks';
import { renderTiddlyWiki } from '../../../../support/runtime/tiddlywiki/renderTiddlyWiki';
import { documentFromBlocks } from '../../../../support/ast/builders/documentFromBlocks';
import { paragraph } from '../../../../support/ast/builders/paragraph';

describe('TiddlyWiki structural parsing and serialization', () => {
  test('rich labels and URL/title attributes preserve literal ampersands and quote delimiters', async () => {
    const link: InlineNode = {
      type: 'link',
      external: true,
      target: 'https://example.org/?a=1&b="two"',
      title: 'a "double" and \'single\' title',
      label: [
        {
          type: 'strong',
          children: [{ type: 'text', value: 'bold & literal' }],
        },
      ],
    };

    const document = documentFromBlocks([paragraph([link])]);

    const serialized = serializeTiddlyWiki(document);

    const html = await renderTiddlyWiki(serialized.text);

    expect(html).toContain(
      'href="https://example.org/?a=1&amp;b=&quot;two&quot;"',
    );

    expect(html).not.toContain('&amp;amp;');

    expect(semanticBlocks(parseTiddlyWiki(serialized.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );
  });
});
