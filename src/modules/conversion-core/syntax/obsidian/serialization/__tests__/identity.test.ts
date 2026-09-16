import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { parseObsidianBlocks } from '@/testing/support/parseObsidianBlocks';

describe('Obsidian semantic serialization', () => {
  test('resolves targets independently of aliases, inline labels and external URLs', () => {
    const document = parseObsidian(
      '[[folder/note|alias]] ![[folder/image.png|250]] [a **label**](folder/note.md) [site](https://example.org)',
    );

    const resolveLink = jest.fn(
      (target: string, kind: 'link' | 'embed') => `${kind}/${target}`,
    );

    const serialized = serializeObsidian(document, { resolveLink });

    expect(serialized.text).toContain('[[link/folder/note|alias]]');
    expect(serialized.text).toContain('![[embed/folder/image.png|250]]');
    expect(serialized.text).toContain('[a **label**](<link/folder/note.md>)');
    expect(serialized.text).toContain('[site](<https://example.org>)');
    expect(resolveLink).toHaveBeenCalledTimes(3);
  });

  test('retains image dimensions, alt text and title together', () => {
    const document: ParsedDocument = {
      dialect: 'tiddlywiki',
      source: '',
      blocks: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'embed',
              kind: 'image',
              target: 'https://example.org/a.png',
              alt: 'Diagram & explanation',
              width: '320',
              height: '200',
              title: 'A title',
            },
          ],
        },
      ],
      tokens: [],
      diagnostics: [],
    };

    const emitted = serializeObsidian(document);

    expect(parseObsidianBlocks(emitted.text)).toEqual(document.blocks);
  });
});
