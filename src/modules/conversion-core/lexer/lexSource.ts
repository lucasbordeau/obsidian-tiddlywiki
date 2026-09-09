import { Dialect } from '../types/Dialect';
import { SyntaxToken } from '../types/SyntaxToken';

function delimitedEnd(source: string, start: number, closing: string): number {
  let cursor = start;
  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (source.startsWith(closing, cursor)) {
      return cursor + closing.length;
    }
    cursor++;
  }
  return source.length;
}

function quotedEnd(source: string, start: number, closing: string): number {
  let cursor = start;
  let quote = '';
  while (cursor < source.length) {
    if (quote) {
      if (source.startsWith(quote, cursor)) {
        cursor += quote.length;
        quote = '';
      } else {
        cursor++;
      }
      continue;
    }
    if (source.startsWith(closing, cursor)) {
      return cursor + closing.length;
    }
    if (source.startsWith('"""', cursor)) {
      quote = '"""';
    } else if (source[cursor] === '"' || source[cursor] === "'") {
      quote = source[cursor];
    }
    cursor += quote.length || 1;
  }
  return source.length;
}

function literalEnd(source: string, start: number, delimiter: string): number {
  const closing = source.indexOf(delimiter, start);
  return closing < 0 ? source.length : closing + delimiter.length;
}

function tiddlyWikiImageEnd(source: string, start: number): number | undefined {
  let cursor = start + 4;
  while (cursor < source.length) {
    const character = source[cursor];
    if (character === '\n' || character === '\r') {
      return undefined;
    }
    const tripleQuote =
      source.startsWith('"""', cursor) || source.startsWith('```', cursor);
    if (tripleQuote) {
      cursor = literalEnd(source, cursor + 3, source.slice(cursor, cursor + 3));
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      cursor = literalEnd(source, cursor + 1, character);
      continue;
    }
    if (source.startsWith('{{{', cursor)) {
      cursor = quotedEnd(source, cursor + 3, '}}}');
      continue;
    }
    if (source.startsWith('{{', cursor)) {
      cursor = quotedEnd(source, cursor + 2, '}}');
      continue;
    }
    if (source.startsWith('<<', cursor)) {
      cursor = quotedEnd(source, cursor + 2, '>>');
      continue;
    }
    if (character === '[') {
      return delimitedEnd(source, cursor + 1, ']]');
    }
    cursor++;
  }
  return undefined;
}

function fenceEnd(
  source: string,
  start: number,
  marker: string,
  dialect: Dialect,
): number {
  let cursor = source.indexOf('\n', start);
  if (cursor < 0) {
    return source.length;
  }
  cursor++;
  const countPattern =
    dialect === 'obsidian' ? `{${marker.length},}` : `{${marker.length}}`;
  const closingPattern = new RegExp(
    `^[ \\t]*(?:>[ \\t]*)*${marker[0]}${countPattern}[ \\t]*\\r?$`,
  );
  while (cursor < source.length) {
    const newline = source.indexOf('\n', cursor);
    const end = newline < 0 ? source.length : newline;
    if (closingPattern.test(source.slice(cursor, end))) {
      return newline < 0 ? end : end + 1;
    }
    cursor = end + 1;
  }
  return source.length;
}

function markdownLinkEnd(source: string, start: number): number | undefined {
  let depth = 1;
  let cursor = start + 1;
  while (cursor < source.length && depth > 0) {
    if (source[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (source[cursor] === '[') {
      depth++;
    }
    if (source[cursor] === ']') {
      depth--;
    }
    cursor++;
  }
  if (depth > 0 || source[cursor] !== '(') {
    return undefined;
  }
  depth = 1;
  cursor++;
  let quote = '';
  while (cursor < source.length && depth > 0) {
    const character = source[cursor];
    if (character === '\\') {
      cursor += 2;
      continue;
    }
    if (quote) {
      if (character === quote) {
        quote = '';
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(') {
      depth++;
    } else if (character === ')') {
      depth--;
    }
    cursor++;
  }
  return depth === 0 ? cursor : undefined;
}

/** Concrete UTF-16 source regions; every source character belongs to one token. */
export function lexSource(source: string, dialect: Dialect): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;
  let lineStart = 0;
  const append = (kind: string, end: number) => {
    const raw = source.slice(cursor, end);
    tokens.push({ kind, range: { start: cursor, end }, raw });
    const lastNewline = raw.lastIndexOf('\n');
    if (lastNewline >= 0) {
      lineStart = cursor + lastNewline + 1;
    }
    cursor = end;
  };

  while (cursor < source.length) {
    const rest = source.slice(cursor);
    const linePrefix = source.slice(lineStart, cursor);
    const isLinePrefix = /^[ \t>]*$/.test(linePrefix);
    const fence = isLinePrefix ? /^(\x60{3,}|~{3,})[^\r\n]*/.exec(rest) : null;
    const isSupportedFence =
      fence && (dialect === 'obsidian' || fence[1] === '```');
    if (isSupportedFence && fence) {
      append('code', fenceEnd(source, cursor, fence[1], dialect));
      continue;
    }

    if (source.startsWith('<!--', cursor)) {
      const closing = source.indexOf('-->', cursor + 4);
      append('comment', closing < 0 ? source.length : closing + 3);
      continue;
    }
    if (dialect === 'obsidian' && source.startsWith('%%', cursor)) {
      append('comment', delimitedEnd(source, cursor + 2, '%%'));
      continue;
    }
    if (dialect === 'tiddlywiki' && source.startsWith('/%', cursor)) {
      append('comment', delimitedEnd(source, cursor + 2, '%/'));
      continue;
    }

    const codeDelimiter = /^`+/.exec(rest);
    if (codeDelimiter) {
      const delimiter = codeDelimiter[0];
      let closing = source.indexOf(delimiter, cursor + delimiter.length);
      while (closing >= 0) {
        const sharesLongerRun =
          source[closing - 1] === '`' ||
          source[closing + delimiter.length] === '`';
        if (!sharesLongerRun) {
          break;
        }
        closing = source.indexOf(delimiter, closing + delimiter.length);
      }
      append(
        closing < 0 ? 'text' : 'code',
        closing < 0 ? cursor + delimiter.length : closing + delimiter.length,
      );
      continue;
    }

    const isWikiEmbed =
      dialect === 'obsidian' && source.startsWith('![[', cursor);
    if (isWikiEmbed || source.startsWith('[[', cursor)) {
      append(
        isWikiEmbed ? 'embed' : 'link',
        delimitedEnd(source, cursor + (isWikiEmbed ? 3 : 2), ']]'),
      );
      continue;
    }
    if (dialect === 'tiddlywiki' && /^\[img(?=\s|\[)/.test(rest)) {
      const end = tiddlyWikiImageEnd(source, cursor);
      if (end !== undefined) {
        append('embed', end);
        continue;
      }
    }
    const isMarkdownImage =
      dialect === 'obsidian' && source.startsWith('![', cursor);
    const isMarkdownLink = dialect === 'obsidian' && source[cursor] === '[';
    if (isMarkdownImage || isMarkdownLink) {
      const end = markdownLinkEnd(source, cursor + (isMarkdownImage ? 1 : 0));
      if (end !== undefined) {
        append(isMarkdownImage ? 'embed' : 'link', end);
        continue;
      }
    }
    const transclusion =
      dialect === 'tiddlywiki' && source.startsWith('{{', cursor);
    if (transclusion) {
      const delimiter = source.startsWith('{{{', cursor) ? '}}}' : '}}';
      append(
        'transclusion',
        delimitedEnd(source, cursor + delimiter.length, delimiter),
      );
      continue;
    }
    const isMacro =
      dialect === 'tiddlywiki' &&
      source.startsWith('<<', cursor) &&
      !source.startsWith('<<<', cursor);
    if (isMacro) {
      append('macro', quotedEnd(source, cursor + 2, '>>'));
      continue;
    }
    const htmlTag = /^<\/?[\w$][\w$:-]*/.exec(rest);
    if (htmlTag) {
      append(
        htmlTag[0].includes('$') ? 'widget' : 'html',
        quotedEnd(source, cursor + htmlTag[0].length, '>'),
      );
      continue;
    }
    const isEscapedCharacter =
      dialect === 'obsidian' &&
      source[cursor] === '\\' &&
      cursor + 1 < source.length;
    if (isEscapedCharacter) {
      append('escape', cursor + 2);
      continue;
    }

    const blockMarker =
      dialect === 'obsidian'
        ? /^(?:#{1,6}(?=[ \t]|$)|[-+*](?=[ \t])|\d+[.)](?=[ \t])|>|\|)/.exec(
            rest,
          )
        : /^(?:!{1,6}|[*#;:]+|<{3,}|>|\||\\[A-Za-z]+)/.exec(rest);
    if (isLinePrefix && blockMarker) {
      append('block-marker', cursor + blockMarker[0].length);
      continue;
    }
    const whitespace = /^\s+/.exec(rest);
    if (whitespace) {
      append('whitespace', cursor + whitespace[0].length);
      continue;
    }
    const delimiter =
      dialect === 'obsidian'
        ? /^(?:\*+|_+|~~|==|\${1,2})/.exec(rest)
        : /^(?:''|\/\/|__|~~|\^\^|,,|@@)/.exec(rest);
    if (delimiter) {
      append('delimiter', cursor + delimiter[0].length);
      continue;
    }
    const plainText = /^[^\s`[!{<\\*_~=$'/,^@]+/.exec(rest);
    append('text', cursor + (plainText?.[0].length ?? 1));
  }
  return tokens;
}
