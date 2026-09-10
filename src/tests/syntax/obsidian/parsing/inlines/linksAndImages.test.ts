import { blocksOf } from '../../../../support/syntax/obsidian/blocksOf';

describe('Obsidian structural parsing', () => {
  test('handles image dimensions, markdown titles and formatted link labels separately', () => {
    const blocks = blocksOf(
      '![[media/a picture.png|320x200]] ![[Other#^block]] ![a label](image.png "Image title") [a **strong** label](https://example.org/a_(b)?q=x_y "Link title")',
    );

    expect(blocks[0]).toMatchObject({
      children: expect.arrayContaining([
        {
          type: 'embed',
          target: 'media/a picture.png',
          kind: 'image',
          alt: '',
          width: '320',
          height: '200',
        },
        { type: 'embed', target: 'Other#^block', kind: 'note', alt: '' },
        {
          type: 'embed',
          target: 'image.png',
          kind: 'image',
          alt: 'a label',
          title: 'Image title',
        },
        expect.objectContaining({
          type: 'link',
          target: 'https://example.org/a_(b)?q=x_y',
          external: true,
          title: 'Link title',
          label: expect.arrayContaining([
            { type: 'strong', children: [{ type: 'text', value: 'strong' }] },
          ]),
        }),
      ]),
    });
  });

  test('extracts image alternate text independently of Markdown formatting', () => {
    expect(blocksOf('![a **strong** and _emphasized_ alt](image.png)')).toEqual(
      [
        {
          type: 'paragraph',
          children: [
            {
              type: 'embed',
              target: 'image.png',
              kind: 'image',
              alt: 'a strong and emphasized alt',
            },
          ],
        },
      ],
    );
  });
});
