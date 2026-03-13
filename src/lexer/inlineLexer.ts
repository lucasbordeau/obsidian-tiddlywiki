import { InlineToken } from './types';

// ---------------------------------------------------------------------------
// Obsidian inline parser
// Delimiters: **bold**, _italic_, <u>underline</u>, `code`
// ---------------------------------------------------------------------------

export function parseObsidianInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let pos = 0;
  let textStart = 0;

  const flush = (end: number) => {
    if (end > textStart) {
      tokens.push({ type: 'text', value: text.slice(textStart, end) });
    }
  };

  while (pos < text.length) {
    // Inline code — no nesting, checked first so backticks inside other spans
    // are not treated as delimiters.
    if (text[pos] === '`') {
      const close = text.indexOf('`', pos + 1);
      if (close !== -1) {
        flush(pos);
        tokens.push({ type: 'inlineCode', value: text.slice(pos + 1, close) });
        pos = close + 1;
        textStart = pos;
        continue;
      }
    }

    // Bold: **...**  (checked before italic so `**` is not split into two `*`)
    if (text.startsWith('**', pos)) {
      const close = text.indexOf('**', pos + 2);
      if (close !== -1) {
        flush(pos);
        tokens.push({
          type: 'bold',
          children: parseObsidianInline(text.slice(pos + 2, close)),
        });
        pos = close + 2;
        textStart = pos;
        continue;
      }
    }

    // Italic: _..._
    if (text[pos] === '_') {
      const close = text.indexOf('_', pos + 1);
      if (close !== -1) {
        flush(pos);
        tokens.push({
          type: 'italic',
          children: parseObsidianInline(text.slice(pos + 1, close)),
        });
        pos = close + 1;
        textStart = pos;
        continue;
      }
    }

    // Underline: <u>...</u>
    if (text.startsWith('<u>', pos)) {
      const close = text.indexOf('</u>', pos + 3);
      if (close !== -1) {
        flush(pos);
        tokens.push({
          type: 'underline',
          children: parseObsidianInline(text.slice(pos + 3, close)),
        });
        pos = close + 4;
        textStart = pos;
        continue;
      }
    }

    pos++;
  }

  flush(text.length);
  return tokens;
}

// ---------------------------------------------------------------------------
// TiddlyWiki inline parser
// Delimiters: ''bold'', //italic//, __underline__, `code`
// ---------------------------------------------------------------------------

export function parseTiddlywikiInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let pos = 0;
  let textStart = 0;

  const flush = (end: number) => {
    if (end > textStart) {
      tokens.push({ type: 'text', value: text.slice(textStart, end) });
    }
  };

  while (pos < text.length) {
    // Inline code — no nesting
    if (text[pos] === '`') {
      const close = text.indexOf('`', pos + 1);
      if (close !== -1) {
        flush(pos);
        tokens.push({ type: 'inlineCode', value: text.slice(pos + 1, close) });
        pos = close + 1;
        textStart = pos;
        continue;
      }
    }

    // Bold: ''...''
    if (text.startsWith("''", pos)) {
      const close = text.indexOf("''", pos + 2);
      if (close !== -1) {
        flush(pos);
        tokens.push({
          type: 'bold',
          children: parseTiddlywikiInline(text.slice(pos + 2, close)),
        });
        pos = close + 2;
        textStart = pos;
        continue;
      }
    }

    // Italic: //...//
    if (text.startsWith('//', pos)) {
      const close = text.indexOf('//', pos + 2);
      if (close !== -1) {
        flush(pos);
        tokens.push({
          type: 'italic',
          children: parseTiddlywikiInline(text.slice(pos + 2, close)),
        });
        pos = close + 2;
        textStart = pos;
        continue;
      }
    }

    // Underline: __...__
    if (text.startsWith('__', pos)) {
      const close = text.indexOf('__', pos + 2);
      if (close !== -1) {
        flush(pos);
        tokens.push({
          type: 'underline',
          children: parseTiddlywikiInline(text.slice(pos + 2, close)),
        });
        pos = close + 2;
        textStart = pos;
        continue;
      }
    }

    pos++;
  }

  flush(text.length);
  return tokens;
}
