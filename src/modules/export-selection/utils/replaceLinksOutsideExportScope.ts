export type ResolveObsidianLink = (
  linkPath: string,
  sourcePath: string,
) => string | null;

export type ScopedLinkReplacement = {
  content: string;
  brokenLinkCount: number;
};

const protectedMarkdownRegex =
  /(^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)|```[\s\S]*?```|`[^`\n]*`)/g;
const obsidianInternalLinkRegex = /(!?)\[\[([^\]\n]+)\]\]/g;

function findFirstUnescapedPipe(linkText: string): number {
  for (
    let characterIndex = 0;
    characterIndex < linkText.length;
    characterIndex++
  ) {
    const isPipe = linkText[characterIndex] === '|';
    const isEscaped =
      characterIndex > 0 && linkText[characterIndex - 1] === '\\';

    if (isPipe && !isEscaped) {
      return characterIndex;
    }
  }

  return -1;
}

function getLinkPath(linkTarget: string): string {
  const subpathStartIndexes = [
    linkTarget.indexOf('#'),
    linkTarget.indexOf('^'),
  ].filter((subpathStartIndex) => subpathStartIndex >= 0);

  if (subpathStartIndexes.length === 0) {
    return linkTarget;
  }

  return linkTarget.slice(0, Math.min(...subpathStartIndexes));
}

function getVisibleLinkText(linkText: string): string {
  const aliasSeparatorIndex = findFirstUnescapedPipe(linkText);

  if (aliasSeparatorIndex >= 0) {
    return linkText.slice(aliasSeparatorIndex + 1);
  }

  return linkText;
}

function getLinkTarget(linkText: string): string {
  const aliasSeparatorIndex = findFirstUnescapedPipe(linkText);

  if (aliasSeparatorIndex >= 0) {
    return linkText.slice(0, aliasSeparatorIndex);
  }

  return linkText;
}

function replaceLinksInMarkdownSegment(
  markdownSegment: string,
  sourcePath: string,
  selectedExportFilePaths: ReadonlySet<string>,
  resolveObsidianLink: ResolveObsidianLink,
): ScopedLinkReplacement {
  let brokenLinkCount = 0;
  const content = markdownSegment.replace(
    obsidianInternalLinkRegex,
    (originalLink, _embedPrefix: string, linkText: string) => {
      const linkTarget = getLinkTarget(linkText);
      const linkPath = getLinkPath(linkTarget);
      const resolvedTargetPath = resolveObsidianLink(linkPath, sourcePath);
      const targetIsOutsideExport =
        resolvedTargetPath !== null &&
        !selectedExportFilePaths.has(resolvedTargetPath);

      if (!targetIsOutsideExport) {
        return originalLink;
      }

      brokenLinkCount += 1;
      return getVisibleLinkText(linkText);
    },
  );

  return { content, brokenLinkCount };
}

export function replaceLinksOutsideExportScope(
  obsidianNoteContent: string,
  sourcePath: string,
  selectedExportFilePaths: ReadonlySet<string>,
  resolveObsidianLink: ResolveObsidianLink,
): ScopedLinkReplacement {
  const markdownSegments = obsidianNoteContent.split(protectedMarkdownRegex);
  let brokenLinkCount = 0;

  const transformedMarkdownSegments = markdownSegments.map(
    (markdownSegment, markdownSegmentIndex) => {
      const segmentIsProtectedMarkdown = markdownSegmentIndex % 2 === 1;

      if (segmentIsProtectedMarkdown) {
        return markdownSegment;
      }

      const linkReplacement = replaceLinksInMarkdownSegment(
        markdownSegment,
        sourcePath,
        selectedExportFilePaths,
        resolveObsidianLink,
      );
      brokenLinkCount += linkReplacement.brokenLinkCount;

      return linkReplacement.content;
    },
  );

  return {
    content: transformedMarkdownSegments.join(''),
    brokenLinkCount,
  };
}
