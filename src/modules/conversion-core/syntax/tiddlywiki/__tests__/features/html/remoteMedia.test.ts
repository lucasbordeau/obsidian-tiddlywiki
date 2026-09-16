import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { parseObsidianBlocks } from '@/testing/support/parseObsidianBlocks';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { renderTiddlyWiki } from '@/testing/support/runtime/renderTiddlyWiki';

const audioUrl = 'https://example.org/signal.mp3?take=1&mode=full';
const videoUrl = 'http://example.org/station.mp4?scene=2&quality=high';

const audioHtml =
  '<audio controls="controls" preload="none" src="https://example.org/signal.mp3?take=1&amp;mode=full"></audio>';

const videoHtml =
  '<video controls="controls" preload="none" src="http://example.org/station.mp4?scene=2&amp;quality=high"></video>';

const audioTiddlyWikiHtml =
  '<audio controls="controls" preload="none" src="https://example.org/signal.mp3?take=1&mode=full"></audio>';

const videoTiddlyWikiHtml =
  '<video controls="controls" preload="none" src="http://example.org/station.mp4?scene=2&quality=high"></video>';

describe('remote HTML media', () => {
  test('parses URL-backed audio and video as semantic embeds in both dialects', () => {
    const source = `${audioHtml}\n\n${videoHtml}`;
    const tiddlyWikiBlocks = parseTiddlyWiki(source).blocks;
    const obsidianBlocks = parseObsidianBlocks(source);

    for (const blocks of [tiddlyWikiBlocks, obsidianBlocks]) {
      expect(blocks[0]).toMatchObject({
        type: 'paragraph',
        children: [{ type: 'embed', kind: 'audio', target: audioUrl, alt: '' }],
      });

      expect(blocks[1]).toMatchObject({
        type: 'paragraph',
        children: [{ type: 'embed', kind: 'video', target: videoUrl, alt: '' }],
      });
    }
  });

  test('keeps controls, lazy loading and encoded URL parameters through two cycles', async () => {
    const source = `${audioTiddlyWikiHtml}\n\n${videoTiddlyWikiHtml}`;
    let tiddlyWikiSource = source;

    for (let cycle = 0; cycle < 2; cycle++) {
      const imported = convertText(tiddlyWikiSource, 'tiddlywiki', 'obsidian', {
        preserveUnsupportedSource: false,
      });

      expect(imported.text).toContain(audioHtml);
      expect(imported.text).toContain(videoHtml);
      expect(imported.text).not.toContain('<!--otw:');

      const exported = convertText(imported.text, 'obsidian', 'tiddlywiki');

      expect(exported.text).toContain(audioTiddlyWikiHtml);
      expect(exported.text).toContain(videoTiddlyWikiHtml);
      expect(exported.text).not.toContain('<!--otw:');
      expect(exported.text).not.toContain('&amp;amp;');

      tiddlyWikiSource = exported.text;
    }

    const rendered = await renderTiddlyWiki(tiddlyWikiSource);

    expect(rendered).toContain('<audio');
    expect(rendered).toContain('<video');
    expect(rendered).toContain('controls="controls"');
    expect(rendered).toContain('preload="none"');
    expect(rendered).toContain('signal.mp3?take=1&amp;mode=full');
  });

  test('keeps a remote player inside static inline formatting', () => {
    const source = `__${audioTiddlyWikiHtml}__`;
    const converted = convertText(source, 'tiddlywiki', 'obsidian');

    expect(converted.text).toContain(`<u>${audioHtml}</u>`);
    expect(converted.text).not.toContain('&lt;audio');
    expect(converted.text).not.toContain('<!--otw:');
  });

  test.each([
    '<audio controls="controls" preload="none" src="javascript:alert(1)"></audio>',
    '<video controls="controls" preload="none" src="https://example.org/movie.mp4" autoplay="autoplay"></video>',
    '<audio controls="controls" preload="none" src="https://example.org/signal.mp3"><source src="https://example.org/signal.mp3"></audio>',
    '<video controls="controls" preload="none" src="https://example.org/station.mp4"><track src="https://example.org/captions.vtt"></video>',
  ])('preserves unsupported media markup as a whole: %s', (source) => {
    for (const dialect of ['obsidian', 'tiddlywiki'] as const) {
      const target = dialect === 'obsidian' ? 'tiddlywiki' : 'obsidian';
      const result = convertText(source, dialect, target);

      expect(result.text).toContain('<!--otw:');
      expect(result.text).not.toContain('<audio controls=');
      expect(result.text).not.toContain('<video controls=');

      const recovered = convertText(result.text, target, dialect);

      expect(recovered.text).toContain(source);
    }
  });
});
