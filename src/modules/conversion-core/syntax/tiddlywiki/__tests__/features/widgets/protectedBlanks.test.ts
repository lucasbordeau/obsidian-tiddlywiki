import { convertText } from '@/modules/conversion-core/conversion/convertText';

describe('official TiddlyWiki feature inventory', () => {
  test('TW-PROTECTED-BLANKS: multiline inline widgets and code span blank lines without exposing their bodies', () => {
    const widget =
      "<$list filter=\"[tag[A]]\">\n\n''literal template''\n\n</$list>";

    const source = 'Before ' + widget + ' after.';

    const outgoing = convertText(source, 'tiddlywiki', 'obsidian');

    expect(outgoing.text).not.toContain('literal template');

    const incoming = convertText(outgoing.text, 'obsidian', 'tiddlywiki');

    expect(incoming.text).toContain(widget);
  });
});
