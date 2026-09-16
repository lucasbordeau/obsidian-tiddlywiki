import { lexSource } from '@/modules/conversion-core/lexing/lexSource';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { renderTiddlyWiki } from '@/testing/support/runtime/renderTiddlyWiki';

describe('TiddlyWiki fence boundaries', () => {
  test('a triple-backtick line immediately after the opener is code content', async () => {
    const source = '```\n```\n[[inside]]';
    const parsed = parseTiddlyWiki(source);
    const rendered = await renderTiddlyWiki(source);

    expect(parsed.blocks[0]).toMatchObject({
      type: 'code',
      value: '```\n[[inside]]',
    });

    expect(rendered).toContain('<pre><code>```\n[[inside]]</code></pre>');

    const tokens = lexSource(source, 'tiddlywiki');

    expect(tokens).toEqual([
      {
        kind: 'code',
        range: { start: 0, end: source.length },
        raw: source,
      },
    ]);
  });

  test('the next triple-backtick line closes after the required content line', () => {
    const source = '```\n```\n```\n[[outside]]';
    const codeSource = '```\n```\n```\n';
    const parsed = parseTiddlyWiki(source);
    const tokens = lexSource(source, 'tiddlywiki');

    expect(parsed.blocks[0]).toMatchObject({ type: 'code', value: '```' });

    expect(tokens.filter((token) => token.kind === 'code')).toEqual([
      {
        kind: 'code',
        range: { start: 0, end: codeSource.length },
        raw: codeSource,
      },
    ]);

    expect(tokens.filter((token) => token.kind === 'link')).toEqual([
      {
        kind: 'link',
        range: { start: codeSource.length, end: source.length },
        raw: '[[outside]]',
      },
    ]);
  });
});
