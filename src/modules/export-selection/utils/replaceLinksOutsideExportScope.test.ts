import { convertObsidianNoteToTiddler } from '../../format-converters/convertObsidianNoteToTiddler';
import {
  replaceLinksOutsideExportScope,
  ResolveObsidianLink,
} from './replaceLinksOutsideExportScope';

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
