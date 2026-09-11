import { parseTiddlyWikiTags } from '../../../modules/conversion-core/metadata/parseTiddlyWikiTags';
import { normalizeObsidianTags } from '../../../modules/conversion-core/metadata/normalizeObsidianTags';
import { formatTiddlyWikiTimestamp } from '../../../modules/conversion-core/metadata/formatTiddlyWikiTimestamp';
import { timestampValues } from './timestampValues';

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
});
