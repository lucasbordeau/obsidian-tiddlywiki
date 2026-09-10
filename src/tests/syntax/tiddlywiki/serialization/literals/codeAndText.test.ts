import { parseTiddlyWiki } from '../../../../../modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '../../../../../modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { semanticBlocks } from '../../../../support/ast/comparison/semanticBlocks';
import { renderTiddlyWiki } from '../../../../support/runtime/tiddlywiki/renderTiddlyWiki';
import { documentFromBlocks } from '../../../../support/ast/builders/documentFromBlocks';
import { paragraph } from '../../../../support/ast/builders/paragraph';

describe('TiddlyWiki structural parsing and serialization', () => {
  test('literal text cannot accidentally introduce TW formatting, widgets, autolinks or list markers', async () => {
    const literal =
      "#tag **stars** ''quotes''' //// __under___ ~~tilde~~ @@style@@ ,,sub,, ^^sup^^ [[link]] {{embed}} <script>alert('x')</script> `code` HelloThere\n* item\n!heading";

    const result = serializeTiddlyWiki(
      documentFromBlocks([paragraph([{ type: 'text', value: literal }])]),
    );

    const html = await renderTiddlyWiki(result.text);

    expect(html).not.toMatch(/<(?:strong|em|u|s|sub|sup|script|ul|h1|a)\b/);
    expect(html).toContain("''quotes'''");
    expect(html).toContain('[[link]] {{embed}} &lt;script&gt;');

    expect(semanticBlocks(parseTiddlyWiki(result.text).blocks)).toEqual(
      semanticBlocks(
        documentFromBlocks([paragraph([{ type: 'text', value: literal }])])
          .blocks,
      ),
    );
  });

  test('code containing TW fences and both quote types stays literal and editable', async () => {
    const literal =
      "```\n'''' //// [[literal]] <strong>html</strong>\nconst x = \"'both'\";";

    const document = documentFromBlocks([
      { type: 'code', value: literal, language: 'c++' },
    ]);

    const serialized = serializeTiddlyWiki(document);

    expect(serialized.text).toContain('<pre><code');
    expect(serialized.text).not.toContain('<!--otw');

    expect(semanticBlocks(parseTiddlyWiki(serialized.text).blocks)).toEqual(
      semanticBlocks(document.blocks),
    );

    const html = await renderTiddlyWiki(serialized.text);

    expect(html).not.toContain('<strong>');
    expect(html).toContain('[[literal]] &lt;strong&gt;html&lt;/strong&gt;');
  });

  test('the official empty-code-fence edge case is retained', async () => {
    const source = '```\n```';

    expect(parseTiddlyWiki(source).blocks[0]).toMatchObject({
      type: 'code',
      value: '```',
    });

    const serialized = serializeTiddlyWiki(parseTiddlyWiki(source)).text;

    expect(await renderTiddlyWiki(serialized)).toContain('```');
    expect(await renderTiddlyWiki(source)).toContain('```');
  });
});
