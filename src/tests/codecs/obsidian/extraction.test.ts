import { extractTagsFromObsidianNote } from '../../../modules/obsidian/splitTagsAndTextFromObsidianNote';

describe('metadata-aware, edit-aware interchange', () => {
  it('keeps underscore tag names inside emphasis and skips hashes in inline literal HTML', () => {
    const note = {
      title: 'Formatted tags',
      content:
        '_#italic_tag_ **#bold_tag** #normal_tag and <code>#code</code> <script>#script</script>\n',
    };

    expect(extractTagsFromObsidianNote(note)).toEqual([
      'italic_tag',
      'bold_tag',
      'normal_tag',
    ]);
  });

  it('distinguishes escaped hashes, punctuation boundaries, Unicode numbers and joined emoji tags', () => {
    const note = {
      title: 'Tags',
      content:
        '\\#escaped (#parenthesized) #👨‍👩‍👧 #١٢٣ #日本\n\n&#35;entity-tag\n',
    };

    expect(extractTagsFromObsidianNote(note)).toEqual([
      'parenthesized',
      '👨‍👩‍👧',
      '日本',
    ]);
  });

  it('extracts property and real body tags while ignoring literals and link destinations', () => {
    const note = {
      title: 'Tags',
      content:
        '---\ntags: [property-tag]\n---\n# Heading\n\n#body-tag and **#bold-tag** `#code-tag` [#label-tag](https://example.com/#url-tag)\n\n```md\n#fenced-tag\n```\n\n- #list-tag\n',
    };

    expect(extractTagsFromObsidianNote(note)).toEqual([
      'property-tag',
      'body-tag',
      'bold-tag',
      'list-tag',
    ]);
  });
});
