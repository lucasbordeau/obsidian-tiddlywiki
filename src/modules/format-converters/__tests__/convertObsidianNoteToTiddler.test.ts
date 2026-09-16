import { exportObsidianNote } from '@/modules/conversion-core/notes/exportObsidianNote';
import { convertObsidianNoteToTiddler } from '@/modules/format-converters/convertObsidianNoteToTiddler';
import { getCodecValue } from '@/testing/support/getCodecValue';

describe('Obsidian note file timestamps', () => {
  test('exports file creation and modification times without YAML properties', () => {
    const tiddler = convertObsidianNoteToTiddler({
      title: 'Dated note',
      content: 'Body',
      creationTimeMs: Date.parse('2024-02-29T21:30:12.456Z'),
      modificationTimeMs: Date.parse('2026-09-16T11:00:00.789Z'),
    });

    expect(tiddler.created).toBe('20240229213012456');
    expect(tiddler.modified).toBe('20260916110000789');
  });

  test('prefers authored YAML dates and fills only the missing timestamp', () => {
    const tiddler = convertObsidianNoteToTiddler({
      title: 'Authored date',
      content: '---\ncreated: 2023-01-02T03:04:05Z\n---\nBody',
      creationTimeMs: Date.parse('2024-02-29T21:30:12.456Z'),
      modificationTimeMs: Date.parse('2026-09-16T11:00:00.789Z'),
    });

    expect(tiddler.created).toBe('20230102030405000');
    expect(tiddler.modified).toBe('20260916110000789');
  });

  test('ignores unusable file times and leaves the portable default undated', () => {
    const invalidHostTiddler = convertObsidianNoteToTiddler({
      title: 'Invalid file times',
      content: 'Body',
      creationTimeMs: Number.NaN,
      modificationTimeMs: Number.POSITIVE_INFINITY,
    });

    const portableTiddler = getCodecValue(
      exportObsidianNote({ title: 'Portable note', content: 'Body' }),
    );

    expect(invalidHostTiddler.created).toBeUndefined();
    expect(invalidHostTiddler.modified).toBeUndefined();
    expect(portableTiddler.created).toBeUndefined();
    expect(portableTiddler.modified).toBeUndefined();
  });
});
