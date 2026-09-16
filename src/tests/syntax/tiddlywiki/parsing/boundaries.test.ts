import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { renderTiddlyWiki } from '@/tests/support/runtime/renderTiddlyWiki';

describe('TiddlyWiki structural parsing and serialization', () => {
  test('global regex regressions stay protected inside links, code and fenced code', () => {
    const source =
      "`''code'' __literal__`\n\n[[literal ''label''|Folder/Case_Sensitive:é]]\n\n```\n!title\n* item\n[[raw]]\n```";

    const document = parseTiddlyWiki(source);

    expect(document.blocks[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'code', value: "''code'' __literal__" }],
    });

    expect(document.blocks[1]).toMatchObject({
      children: [
        {
          type: 'link',
          target: 'Folder/Case_Sensitive:é',
          label: [{ type: 'text', value: "literal ''label''" }],
        },
      ],
    });

    expect(document.blocks[2]).toMatchObject({
      type: 'code',
      value: '!title\n* item\n[[raw]]',
    });
  });

  test('a heading-looking line inside an existing paragraph follows TW block boundaries', async () => {
    const source = 'Paragraph\n!This is inline text\n\n!This is a heading';

    const document = parseTiddlyWiki(source);

    expect(document.blocks.map((block) => block.type)).toEqual([
      'paragraph',
      'heading',
    ]);

    expect(await renderTiddlyWiki(serializeTiddlyWiki(document).text)).toBe(
      await renderTiddlyWiki(source),
    );
  });

  test('lexical coverage and UTF-16 source spans remain exact on CRLF and astral Unicode', () => {
    const source = '!🙂é\r\n\r\n* one\r\n*# [[Unicode|路径/💡]]\r\n';

    const document = parseTiddlyWiki(source);

    expect(document.tokens.map((token) => token.raw).join('')).toBe(source);

    let offset = 0;

    for (const token of document.tokens) {
      expect(token.range.start).toBe(offset);
      expect(source.slice(token.range.start, token.range.end)).toBe(token.raw);

      offset = token.range.end;
    }

    expect(offset).toBe(source.length);

    expect(document.blocks[0]).toMatchObject({
      range: { start: 0, end: 4 },
      children: [{ range: { start: 1, end: 4 } }],
    });
  });
});
