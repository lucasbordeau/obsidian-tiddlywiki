import MarkdownIt from 'markdown-it';
import { isObsidianWebEmbed } from './isObsidianWebEmbed';

function findDelimiter(
  source: string,
  delimiter: string,
  start: number,
  skipCode = false,
): number {
  let position = start;
  while (position < source.length) {
    if (source[position] === '\\') {
      position += 2;
      continue;
    }
    if (skipCode && source[position] === '`') {
      const run = /^`+/.exec(source.slice(position))?.[0] ?? '`';
      const backticks = /`+/g;
      backticks.lastIndex = position + run.length;
      let closingRun: RegExpExecArray | null;
      let end = -1;
      while ((closingRun = backticks.exec(source)) !== null) {
        if (closingRun[0].length !== run.length) {
          continue;
        }
        end = closingRun.index;
        break;
      }
      if (end !== -1) {
        position = end + run.length;
        continue;
      }
    }
    if (source.startsWith(delimiter, position)) {
      return position;
    }
    position++;
  }
  return -1;
}

function pushInlineToken(
  state: MarkdownIt.StateInline,
  type: string,
  content: string,
  end: number,
  silent: boolean,
): boolean {
  if (!silent) {
    const token = state.push(type, '', 0);
    token.content = content;
  }
  state.pos = end;
  return true;
}

function webEmbed(state: MarkdownIt.StateInline, silent: boolean): boolean {
  if (!state.src.startsWith('![', state.pos)) {
    return false;
  }
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
  if (labelEnd === -1 || state.src[labelEnd + 1] !== '(') {
    return false;
  }
  let position = labelEnd + 2;
  while (/\s/.test(state.src[position] ?? '') && position < state.posMax) {
    position++;
  }
  const destination = state.md.helpers.parseLinkDestination(
    state.src,
    position,
    state.posMax,
  );
  if (!destination.ok || !isObsidianWebEmbed(destination.str)) {
    return false;
  }
  position = destination.pos;
  const startsWhitespace = /\s/.test(state.src[position] ?? '');
  while (/\s/.test(state.src[position] ?? '') && position < state.posMax) {
    position++;
  }
  const title = state.md.helpers.parseLinkTitle(
    state.src,
    position,
    state.posMax,
  );
  if (startsWhitespace && title.ok) {
    position = title.pos;
    while (/\s/.test(state.src[position] ?? '') && position < state.posMax) {
      position++;
    }
  }
  if (state.src[position] !== ')') {
    return false;
  }
  const originalEmbed = state.src.slice(state.pos, position + 1);
  return pushInlineToken(
    state,
    'otw_web_embed',
    originalEmbed,
    position + 1,
    silent,
  );
}

function obsidianInline(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);
  const embedded = remaining.startsWith('![[');
  const wikiLink = remaining.startsWith('[[');
  if (embedded || wikiLink) {
    const openingLength = embedded ? 3 : 2;
    const end = findDelimiter(state.src, ']]', state.pos + openingLength);
    const crossesLine =
      end !== -1 && state.src.slice(state.pos, end).includes('\n');
    if (end === -1 || crossesLine) {
      return false;
    }
    const content = state.src.slice(state.pos + openingLength, end);
    return pushInlineToken(
      state,
      embedded ? 'otw_embed' : 'otw_wikilink',
      content,
      end + 2,
      silent,
    );
  }

  if (webEmbed(state, silent)) {
    return true;
  }

  if (remaining.startsWith('%%')) {
    const end = state.src.indexOf('%%', state.pos + 2);
    if (end === -1) {
      return false;
    }
    return pushInlineToken(
      state,
      'otw_comment',
      state.src.slice(state.pos, end + 2),
      end + 2,
      silent,
    );
  }

  if (remaining.startsWith('==') && !remaining.startsWith('===')) {
    const end = findDelimiter(state.src, '==', state.pos + 2, true);
    if (end === -1 || end === state.pos + 2) {
      return false;
    }
    const content = state.src.slice(state.pos + 2, end);
    if (!silent) {
      const token = state.push('otw_highlight', '', 0);
      token.children = [];
      state.md.inline.parse(content, state.md, state.env, token.children);
    }
    state.pos = end + 2;
    return true;
  }

  const footnote = /^\[\^([^\]\n]+)\]/.exec(remaining);
  if (footnote) {
    return pushInlineToken(
      state,
      'otw_footnote_reference',
      footnote[1],
      state.pos + footnote[0].length,
      silent,
    );
  }

  if (remaining.startsWith('^[')) {
    const closingBracket = state.md.helpers.parseLinkLabel(
      state,
      state.pos + 1,
      false,
    );
    if (closingBracket === -1) {
      return false;
    }
    const originalFootnote = state.src.slice(state.pos, closingBracket + 1);
    return pushInlineToken(
      state,
      'otw_inline_footnote',
      originalFootnote,
      closingBracket + 1,
      silent,
    );
  }

  const opensMath =
    remaining[0] === '$' &&
    remaining[1] !== '$' &&
    !/\s/.test(remaining[1] ?? ' ');
  if (opensMath) {
    const end = findDelimiter(state.src, '$', state.pos + 1);
    const closesMath =
      end !== -1 &&
      !/\s/.test(state.src[end - 1]) &&
      !/\d/.test(state.src[end + 1] ?? '');
    if (closesMath) {
      return pushInlineToken(
        state,
        'otw_math',
        state.src.slice(state.pos + 1, end),
        end + 1,
        silent,
      );
    }
  }

  const blockIdentifier = /^\^[a-zA-Z0-9-]+(?=\s*$)/.exec(remaining);
  const startsBlockIdentifier =
    state.pos === 0 || /\s/.test(state.src[state.pos - 1]);
  if (blockIdentifier && startsBlockIdentifier) {
    return pushInlineToken(
      state,
      'otw_block_identifier',
      blockIdentifier[0],
      state.pos + blockIdentifier[0].length,
      silent,
    );
  }

  return false;
}

function htmlRegion(state: MarkdownIt.StateInline, silent: boolean): boolean {
  const remaining = state.src.slice(state.pos);
  const openingTag = /^<([a-z][a-z0-9-]*)\b[^>]*>/i.exec(remaining);
  if (!openingTag) {
    return false;
  }
  const voidElement =
    /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(
      openingTag[1],
    );
  const selfClosing = openingTag[0].endsWith('/>');
  if (voidElement || selfClosing) {
    return false;
  }
  const tagName = openingTag[1];
  const matchingTags = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi');
  matchingTags.lastIndex = openingTag[0].length;
  let depth = 1;
  let nextTag: RegExpExecArray | null;
  while ((nextTag = matchingTags.exec(remaining)) !== null) {
    depth += nextTag[1] ? -1 : 1;
    if (depth !== 0) {
      continue;
    }
    const content = remaining.slice(0, matchingTags.lastIndex);
    return pushInlineToken(
      state,
      'otw_html',
      content,
      state.pos + content.length,
      silent,
    );
  }
  return false;
}

function lineText(state: MarkdownIt.StateBlock, line: number): string {
  return state.src.slice(
    state.bMarks[line] + state.tShift[line],
    state.eMarks[line],
  );
}

function pushBlockToken(
  state: MarkdownIt.StateBlock,
  type: string,
  startLine: number,
  endLine: number,
  content: string,
  silent: boolean,
): boolean {
  if (silent) {
    return true;
  }
  const token = state.push(type, '', 0);
  token.block = true;
  token.map = [startLine, endLine];
  token.content = content;
  state.line = endLine;
  return true;
}

function obsidianBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  const firstLine = lineText(state, startLine);
  const frontMatter =
    startLine === 0 &&
    state.parentType === 'root' &&
    firstLine.trim() === '---';
  if (frontMatter) {
    let closingLine = startLine + 1;
    while (closingLine < endLine) {
      const closesFrontMatter = /^(---|\.\.\.)\s*$/.test(
        lineText(state, closingLine),
      );
      if (closesFrontMatter) {
        break;
      }
      closingLine++;
    }
    if (closingLine < endLine) {
      return pushBlockToken(
        state,
        'otw_frontmatter',
        startLine,
        closingLine + 1,
        state.getLines(startLine, closingLine + 1, state.blkIndent, true),
        silent,
      );
    }
  }

  if (firstLine.trim() === '$$') {
    let closingLine = startLine + 1;
    while (closingLine < endLine) {
      const closesMathBlock = lineText(state, closingLine).trim() === '$$';
      if (closesMathBlock) {
        break;
      }
      closingLine++;
    }
    if (closingLine < endLine) {
      const content = state
        .getLines(startLine + 1, closingLine, state.blkIndent, true)
        .replace(/\n$/, '');
      return pushBlockToken(
        state,
        'otw_math_block',
        startLine,
        closingLine + 1,
        content,
        silent,
      );
    }
  }

  const singleLineMath = /^\$\$(.+)\$\$\s*$/.exec(firstLine);
  if (singleLineMath) {
    return pushBlockToken(
      state,
      'otw_math_block',
      startLine,
      startLine + 1,
      singleLineMath[1],
      silent,
    );
  }

  const footnoteDefinition = /^\[\^([^\]]+)\]:[ \t]*(.*)$/.exec(firstLine);
  if (footnoteDefinition) {
    let closingLine = startLine + 1;
    let lastContentLine = startLine;
    let continuationIndent = 4;
    while (closingLine < endLine) {
      const emptyLine = state.isEmpty(closingLine);
      const relativeIndent = state.sCount[closingLine] - state.blkIndent;
      const indentedContinuation = relativeIndent >= 2;
      if (!emptyLine && !indentedContinuation) {
        break;
      }
      if (!emptyLine) {
        lastContentLine = closingLine;
        if (relativeIndent < 4) {
          continuationIndent = 2;
        }
      }
      closingLine++;
    }
    const end = lastContentLine + 1;
    const continuation = state.getLines(
      startLine + 1,
      end,
      state.blkIndent + continuationIndent,
      true,
    );
    const content = `${footnoteDefinition[2]}\n${continuation}`;
    const matched = pushBlockToken(
      state,
      'otw_footnote_definition',
      startLine,
      end,
      content,
      silent,
    );
    if (!silent) {
      state.tokens[state.tokens.length - 1].meta = {
        identifier: footnoteDefinition[1],
      };
    }
    return matched;
  }

  if (firstLine.startsWith('%%')) {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const closing = state.src.indexOf('%%', start + 2);
    if (closing === -1) {
      return false;
    }
    let closingLine = startLine;
    while (closingLine + 1 < endLine) {
      const nextLineFollowsComment =
        state.bMarks[closingLine + 1] > closing + 2;
      if (nextLineFollowsComment) {
        break;
      }
      closingLine++;
    }
    const tail = state.src.slice(closing + 2, state.eMarks[closingLine]);
    if (tail.trim() !== '') {
      return false;
    }
    const content = state
      .getLines(startLine, closingLine + 1, state.blkIndent, true)
      .replace(/\n$/, '');
    return pushBlockToken(
      state,
      'otw_comment_block',
      startLine,
      closingLine + 1,
      content,
      silent,
    );
  }

  return false;
}

export function registerObsidianRules(markdown: MarkdownIt): void {
  markdown.inline.ruler.before('image', 'otw_obsidian', obsidianInline);
  markdown.inline.ruler.before('html_inline', 'otw_html_region', htmlRegion);
  markdown.block.ruler.before('fence', 'otw_obsidian_block', obsidianBlock, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
}
