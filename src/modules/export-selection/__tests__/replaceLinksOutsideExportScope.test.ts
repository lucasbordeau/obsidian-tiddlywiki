import { convertObsidianNoteToTiddler } from '@/modules/format-converters/convertObsidianNoteToTiddler';
import {
  replaceLinksOutsideExportScope,
  ResolveObsidianLink,
} from '@/modules/export-selection/replaceLinksOutsideExportScope';

const resolvedVaultLinks = new Map<string, string>([
  ['Current note.md::Included', 'Included.md'],
  ['Current note.md::Excluded', 'Archive/Excluded.md'],
  ['Current note.md::Asset.png', 'Attachments/Asset.png'],
]);

const resolveObsidianLink: ResolveObsidianLink = (linkPath, sourcePath) => {
  if (linkPath === '') {
    return sourcePath;
  }

  return resolvedVaultLinks.get(`${sourcePath}::${linkPath}`) ?? null;
};

describe('links outside export scope', () => {
  test('counts and replaces only targets excluded from the selection', () => {
    const selectedExportFilePaths = new Set(['Current note.md', 'Included.md']);

    const linkReplacement = replaceLinksOutsideExportScope(
      'Keep [[Included]]. Replace [[Excluded|readable text]]. Leave [[Missing]].',
      'Current note.md',
      selectedExportFilePaths,
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: 'Keep [[Included]]. Replace readable text. Leave [[Missing]].',
      brokenLinkCount: 1,
    });
  });

  test('counts every broken occurrence and retains its visible text', () => {
    const selectedExportFilePaths = new Set(['Current note.md']);

    const linkReplacement = replaceLinksOutsideExportScope(
      '[[Excluded]] then [[Excluded#Details|the details]] and ![[Asset.png]].',
      'Current note.md',
      selectedExportFilePaths,
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: 'Excluded then the details and Asset.png.',
      brokenLinkCount: 3,
    });
  });

  test('keeps self-links and links inside code unchanged', () => {
    const selectedExportFilePaths = new Set(['Current note.md']);

    const noteContent = [
      'Keep [[#Local heading]].',
      '`[[Excluded]]`',
      '```md',
      '[[Excluded|example]]',
      '```',
    ].join('\n');

    const linkReplacement = replaceLinksOutsideExportScope(
      noteContent,
      'Current note.md',
      selectedExportFilePaths,
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: noteContent,
      brokenLinkCount: 0,
    });
  });

  test.each([
    ['double-backtick code spans', '``[[Excluded]]``'],
    ['tilde code fences', '~~~md\n[[Excluded]]\n~~~'],
    ['indented code blocks', '    [[Excluded]]'],
  ])('keeps links inside %s unchanged', (_context, code) => {
    const noteContent = `${code}\n\nOutside [[Excluded]].`;

    const linkReplacement = replaceLinksOutsideExportScope(
      noteContent,
      'Current note.md',
      new Set(['Current note.md']),
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: `${code}\n\nOutside Excluded.`,
      brokenLinkCount: 1,
    });
  });

  test('rewrites a nested-list link without mistaking indentation for code', () => {
    const noteContent = '- Parent\n    - [[Excluded]]';

    const linkReplacement = replaceLinksOutsideExportScope(
      noteContent,
      'Current note.md',
      new Set(['Current note.md']),
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: '- Parent\n    - Excluded',
      brokenLinkCount: 1,
    });
  });

  test('rewrites links after many unmatched backtick delimiter lengths', () => {
    const unmatchedDelimiters = Array.from({ length: 256 }, (_, index) =>
      '`'.repeat(index + 1),
    ).join(' ');

    const noteContent = `${unmatchedDelimiters}\n\n[[Excluded]]`;

    const linkReplacement = replaceLinksOutsideExportScope(
      noteContent,
      'Current note.md',
      new Set(['Current note.md']),
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: `${unmatchedDelimiters}\n\nExcluded`,
      brokenLinkCount: 1,
    });
  });

  test('treats a backslash-prefixed backtick as a closing code delimiter', () => {
    const noteContent = '`code \\` [[Excluded]] ` trailing';

    const linkReplacement = replaceLinksOutsideExportScope(
      noteContent,
      'Current note.md',
      new Set(['Current note.md']),
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: '`code \\` Excluded ` trailing',
      brokenLinkCount: 1,
    });
  });

  test('lets remaining backticks after an escape open a code span', () => {
    const noteContent = '\\``[[Excluded]]` and [[Excluded]]';

    const linkReplacement = replaceLinksOutsideExportScope(
      noteContent,
      'Current note.md',
      new Set(['Current note.md']),
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: '\\``[[Excluded]]` and Excluded',
      brokenLinkCount: 1,
    });
  });

  test.each([
    ['CR', '\r'],
    ['CRLF', '\r\n'],
  ])(
    'keeps tilde code fences intact with %s line endings',
    (_label, newline) => {
      const code = `Intro${newline}~~~${newline}[[Excluded]]${newline}~~~`;
      const noteContent = `${code}${newline}Outside [[Excluded]]`;

      const linkReplacement = replaceLinksOutsideExportScope(
        noteContent,
        'Current note.md',
        new Set(['Current note.md']),
        resolveObsidianLink,
      );

      expect(linkReplacement).toEqual({
        content: `${code}${newline}Outside Excluded`,
        brokenLinkCount: 1,
      });
    },
  );

  test('ignores links in front matter removed during conversion', () => {
    const selectedExportFilePaths = new Set(['Current note.md']);

    const noteContent = [
      '---',
      'related: "[[Excluded]]"',
      '---',
      'Visible note text.',
    ].join('\n');

    const linkReplacement = replaceLinksOutsideExportScope(
      noteContent,
      'Current note.md',
      selectedExportFilePaths,
      resolveObsidianLink,
    );

    expect(linkReplacement).toEqual({
      content: noteContent,
      brokenLinkCount: 0,
    });
  });

  test('removes the unresolved link markup from exported tiddler text', () => {
    const linkReplacement = replaceLinksOutsideExportScope(
      'See [[Excluded|archived plan]].',
      'Current note.md',
      new Set(['Current note.md']),
      resolveObsidianLink,
    );

    const exportedTiddler = convertObsidianNoteToTiddler({
      title: 'Current note',
      content: linkReplacement.content,
    });

    expect(linkReplacement.brokenLinkCount).toBe(1);
    expect(exportedTiddler.text).toBe('See archived plan.');
  });
});
