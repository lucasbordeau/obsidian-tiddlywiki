import { createObsidianParser } from '@/modules/conversion-core/syntax/obsidian/parsing/createObsidianParser';

export type ResolveObsidianLink = (
  linkPath: string,
  sourcePath: string,
) => string | null;

export type ScopedLinkReplacement = {
  content: string;
  brokenLinkCount: number;
};

const obsidianInternalLinkRegex = /(!?)\[\[([^\n\]]+)\]\]/g;

type ProtectedRange = { start: number; end: number };

type CodeDelimiterRun = {
  start: number;
  end: number;
  openingStart?: number;
  matchingEnd?: number;
};

function getLineOffsets(source: string): number[] {
  const lineOffsets = [0];

  for (let position = 0; position < source.length; position++) {
    const isCarriageReturn = source[position] === '\r';

    if (isCarriageReturn && source[position + 1] === '\n') {
      position++;
    }

    if (isCarriageReturn || source[position] === '\n') {
      lineOffsets.push(position + 1);
    }
  }

  return lineOffsets;
}

function getProtectedBlockRanges(source: string): ProtectedRange[] {
  const obsidianParser = createObsidianParser();
  const lineOffsets = getLineOffsets(source);
  const blockTokens = obsidianParser.parse(source, {});

  return blockTokens.flatMap((token) => {
    const isProtectedBlock =
      token.type === 'otw_frontmatter' ||
      token.type === 'fence' ||
      token.type === 'code_block';

    if (!isProtectedBlock || !token.map) {
      return [];
    }

    return [
      {
        start: lineOffsets[token.map[0]],
        end: lineOffsets[token.map[1]] ?? source.length,
      },
    ];
  });
}

function isEscapedBacktick(source: string, position: number): boolean {
  let backslashCount = 0;
  let precedingPosition = position - 1;

  while (precedingPosition >= 0) {
    const isBackslash = source[precedingPosition] === '\\';

    if (!isBackslash) {
      break;
    }

    backslashCount++;
    precedingPosition--;
  }

  return backslashCount % 2 === 1;
}

function getBacktickRunEnd(source: string, start: number): number {
  let end = start;

  while (end < source.length && source[end] === '`') {
    end++;
  }

  return end;
}

function getCodeDelimiterRuns(source: string): CodeDelimiterRun[] {
  const delimiterRuns: CodeDelimiterRun[] = [];
  let position = 0;

  while (position < source.length) {
    if (source[position] !== '`') {
      position++;

      continue;
    }

    const runEnd = getBacktickRunEnd(source, position);
    const escaped = isEscapedBacktick(source, position);
    const openingStart = escaped ? position + 1 : position;

    delimiterRuns.push({
      start: position,
      end: runEnd,
      openingStart: openingStart < runEnd ? openingStart : undefined,
    });

    position = runEnd;
  }

  const nextRunEndByLength = new Map<number, number>();

  for (let runIndex = delimiterRuns.length - 1; runIndex >= 0; runIndex--) {
    const delimiterRun = delimiterRuns[runIndex];

    const openingLength =
      delimiterRun.openingStart === undefined
        ? undefined
        : delimiterRun.end - delimiterRun.openingStart;

    if (openingLength !== undefined) {
      delimiterRun.matchingEnd = nextRunEndByLength.get(openingLength);
    }

    const rawRunLength = delimiterRun.end - delimiterRun.start;

    nextRunEndByLength.set(rawRunLength, delimiterRun.end);
  }

  return delimiterRuns;
}

function getCodeSpanRanges(
  source: string,
  sourceOffset: number,
): ProtectedRange[] {
  const delimiterRuns = getCodeDelimiterRuns(source);
  const codeSpanRanges: ProtectedRange[] = [];
  let runIndex = 0;

  while (runIndex < delimiterRuns.length) {
    const openingRun = delimiterRuns[runIndex];
    const closingEnd = openingRun.matchingEnd;

    if (openingRun.openingStart === undefined || closingEnd === undefined) {
      runIndex++;

      continue;
    }

    codeSpanRanges.push({
      start: sourceOffset + openingRun.openingStart,
      end: sourceOffset + closingEnd,
    });

    while (runIndex < delimiterRuns.length) {
      const runStartsBeforeClosing = delimiterRuns[runIndex].start < closingEnd;

      if (!runStartsBeforeClosing) {
        break;
      }

      runIndex++;
    }
  }

  return codeSpanRanges;
}

function getProtectedMarkdownRanges(source: string): ProtectedRange[] {
  const blockRanges = getProtectedBlockRanges(source).sort(
    (left, right) => left.start - right.start,
  );

  const protectedRanges: ProtectedRange[] = [];
  let lastBlockEnd = 0;

  for (const blockRange of blockRanges) {
    const sourceBeforeBlock = source.slice(lastBlockEnd, blockRange.start);

    protectedRanges.push(
      ...getCodeSpanRanges(sourceBeforeBlock, lastBlockEnd),
      blockRange,
    );

    lastBlockEnd = blockRange.end;
  }

  protectedRanges.push(
    ...getCodeSpanRanges(source.slice(lastBlockEnd), lastBlockEnd),
  );

  return protectedRanges;
}

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
  const protectedRanges = getProtectedMarkdownRanges(obsidianNoteContent);
  const convertedSourceParts: string[] = [];
  let brokenLinkCount = 0;
  let unprotectedStart = 0;

  for (const protectedRange of protectedRanges) {
    const linkReplacement = replaceLinksInMarkdownSegment(
      obsidianNoteContent.slice(unprotectedStart, protectedRange.start),
      sourcePath,
      selectedExportFilePaths,
      resolveObsidianLink,
    );

    brokenLinkCount += linkReplacement.brokenLinkCount;

    convertedSourceParts.push(
      linkReplacement.content,
      obsidianNoteContent.slice(protectedRange.start, protectedRange.end),
    );

    unprotectedStart = protectedRange.end;
  }

  const finalLinkReplacement = replaceLinksInMarkdownSegment(
    obsidianNoteContent.slice(unprotectedStart),
    sourcePath,
    selectedExportFilePaths,
    resolveObsidianLink,
  );

  brokenLinkCount += finalLinkReplacement.brokenLinkCount;

  convertedSourceParts.push(finalLinkReplacement.content);

  return {
    content: convertedSourceParts.join(''),
    brokenLinkCount,
  };
}
