import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { normalizeSemanticBlocks } from '@/tests/support/ast/normalizeSemanticBlocks';
import { renderTiddlyWiki } from '@/tests/support/runtime/renderTiddlyWiki';
import { createDocumentFromBlocks } from '@/tests/support/ast/createDocumentFromBlocks';
import { createParagraph } from '@/tests/support/ast/createParagraph';

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

    const document = createDocumentFromBlocks([createParagraph([link])]);

    const serialized = serializeTiddlyWiki(document);

    const html = await renderTiddlyWiki(serialized.text);

    expect(html).toContain(
      'href="https://example.org/?a=1&amp;b=&quot;two&quot;"',
    );

    expect(html).not.toContain('&amp;amp;');

    expect(
      normalizeSemanticBlocks(parseTiddlyWiki(serialized.text).blocks),
    ).toEqual(normalizeSemanticBlocks(document.blocks));
  });
});
