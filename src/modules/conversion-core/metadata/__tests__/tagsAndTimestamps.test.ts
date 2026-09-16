import { parseTiddlyWikiTags } from '@/modules/conversion-core/metadata/parseTiddlyWikiTags';
import { normalizeObsidianTags } from '@/modules/conversion-core/metadata/normalizeObsidianTags';
import { formatTiddlyWikiTimestamp } from '@/modules/conversion-core/metadata/formatTiddlyWikiTimestamp';
import { parseTiddlyWikiTimestampToEpochMilliseconds } from '@/modules/conversion-core/metadata/parseTiddlyWikiTimestampToEpochMilliseconds';
import { timestampValues } from '@/modules/conversion-core/metadata/__tests__/timestampValues';

describe('structural front matter and metadata values', () => {
  it('normalizes tags reversibly across spaces, case, Unicode and name collisions', () => {
    const tags = parseTiddlyWikiTags(
      '[[North America]] North_America CAFÉ café world/été 123',
    );

    expect(normalizeObsidianTags(tags)).toEqual({
      North_America: 'North America',
      North_America_2: 'North_America',
      CAFÉ: 'CAFÉ',
      café_2: 'café',
      'world/été': 'world/été',
      tag_123: '123',
    });
  });

  it.each(timestampValues)(
    'normalizes only explicit supported dates: %s',
    (source, expected) => {
      expect(formatTiddlyWikiTimestamp(source)).toBe(expected);
    },
  );

  it('normalizes timezone-less Obsidian date-times only with an explicit UTC policy', () => {
    expect(formatTiddlyWikiTimestamp('2024-02-29T21:30:12')).toBe(
      '2024-02-29T21:30:12',
    );

    expect(formatTiddlyWikiTimestamp('2024-02-29T21:30:12', true)).toBe(
      '20240229213012000',
    );
  });

  it.each([
    ['20240229213012456', Date.UTC(2024, 1, 29, 21, 30, 12, 456)],
    ['20260916110000000', Date.UTC(2026, 8, 16, 11, 0, 0)],
    ['20240230010101000', undefined],
    ['20240229246000000', undefined],
    ['20240229120060000', undefined],
    ['not-a-date', undefined],
  ])(
    'parses a TiddlyWiki timestamp for file metadata: %s',
    (source, expected) => {
      expect(parseTiddlyWikiTimestampToEpochMilliseconds(source)).toBe(
        expected,
      );
    },
  );
});
