import { convertText } from '../../../../../modules/conversion-core/conversion/convertText';
import { parseObsidian } from '../../../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { renderTiddlyWiki } from '../../../../support/runtime/renderTiddlyWiki';
import { collectAllInlines } from '../../../../support/ast/collectAllInlines';
import { assertStableRoundTrip } from '../../../../support/assertStableRoundTrip';
import { imageExtensions } from './imageExtensions';
import { imageContexts } from './imageContexts';
import { markdownImageVariants } from './markdownImageVariants';

describe('official Obsidian feature inventory', () => {
  describe.each(imageExtensions)('O-IMAGE: .%s', (extension) => {
    test.each(imageContexts)(
      '%s retains local image identity, dimensions and nesting',
      (_context, template) => {
        const target = `assets/研究 café (final).${extension}`;

        const source = template.replace(
          'IMAGE',
          `![[${target}${template.includes('| Preview') ? '\\|' : '|'}320x180]]`,
        );

        const images = collectAllInlines(parseObsidian(source).blocks).filter(
          (node) => node.type === 'embed',
        );

        expect(images).toEqual([
          expect.objectContaining({
            type: 'embed',
            kind: 'image',
            target,
            width: '320',
            height: '180',
          }),
        ]);

        assertStableRoundTrip(source);
      },
    );
  });

  test.each(markdownImageVariants)(
    'O-MARKDOWN-IMAGE: %s',
    (_description, source, expected) => {
      const embeds = collectAllInlines(
        parseObsidian(source as string).blocks,
      ).filter((node) => node.type === 'embed');

      expect(embeds).toEqual([expect.objectContaining(expected)]);

      assertStableRoundTrip(source as string);
    },
  );

  test('O-IMAGE-RENDER: real TiddlyWiki renders an external image with distinct alt, tooltip and size', async () => {
    const source =
      '![A & B|300x120](https://example.org/image.png?x=1&y=2 "A different title")';

    const outgoing = convertText(source, 'obsidian', 'tiddlywiki');

    const html = await renderTiddlyWiki(outgoing.text);

    expect(html).toContain('<img');
    expect(html).toContain('alt="A &amp; B"');
    expect(html).toContain('title="A different title"');
    expect(html).toContain('width="300"');
    expect(html).toContain('height="120"');
    expect(html).toContain('src="https://example.org/image.png?x=1&amp;y=2"');
  });
});
