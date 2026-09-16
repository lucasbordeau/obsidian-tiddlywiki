import { convertText } from '@/modules/conversion-core/conversion/convertText';

describe('TiddlyWiki example boxes', () => {
  test('converts a static example box to an Obsidian example callout', () => {
    const source = [
      '<div class="tc-example-box">',
      'Example with {{Another note}}.',
      '</div>',
    ].join('\n');

    const converted = convertText(source, 'tiddlywiki', 'obsidian');

    expect(converted.text).toBe(
      '> [!example]\n> Example with ![[Another note]].',
    );

    expect(converted.text).not.toContain('<!--otw');
  });
});
