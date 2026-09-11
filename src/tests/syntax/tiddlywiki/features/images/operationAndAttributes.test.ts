import { convertText } from '../../../../../modules/conversion-core/conversion/convertText';
import { parseTiddlyWiki } from '../../../../../modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { renderTiddlyWiki } from '../../../../support/runtime/renderTiddlyWiki';
import { imageExtensions } from './imageExtensions';

describe('official TiddlyWiki feature inventory', () => {
  test.each(imageExtensions)(
    'TW-EMBED-IMAGE-%s: image transclusion retains its operation through nearby edits',
    (extension) => {
      const source = '{{assets/diagram.' + extension + '}}';

      const original = parseTiddlyWiki(source);

      expect(original.blocks[0]).toMatchObject({
        children: [
          {
            type: 'embed',
            kind: 'note',
            target: 'assets/diagram.' + extension,
          },
        ],
      });

      const outgoing = convertText(source, 'tiddlywiki', 'obsidian');

      const incoming = convertText(
        outgoing.text + '\n\nEdited nearby.',
        'obsidian',
        'tiddlywiki',
      );

      expect(incoming.text).toContain(source);
      expect(incoming.text).toContain('Edited nearby.');
    },
  );

  test('TW-IMAGE-SEMANTICS: alt, tooltip, dimensions, quoting and literal URLs remain distinct', async () => {
    const source =
      '[img alt="Accessible description" width=125px height=50% [Mouse tooltip|https://example.org/a.svg?x=1&y=2]]';

    const original = parseTiddlyWiki(source);

    expect(original.blocks[0]).toMatchObject({
      children: [
        {
          type: 'embed',
          kind: 'image',
          alt: 'Accessible description',
          title: 'Mouse tooltip',
          width: '125px',
          height: '50%',
          target: 'https://example.org/a.svg?x=1&y=2',
        },
      ],
    });

    const markdown = convertText(source, 'tiddlywiki', 'obsidian');

    const recovered = convertText(markdown.text, 'obsidian', 'tiddlywiki');

    expect(await renderTiddlyWiki(recovered.text)).toBe(
      await renderTiddlyWiki(source),
    );
  });
});
