/**
 * Half-open UTF-16 offsets into the original source string.
 *
 * ```ts
 * const source = 'a🙂b';
 * const range: SourceRange = { start: 1, end: 3 };
 * source.slice(range.start, range.end); // '🙂' (two UTF-16 code units)
 * const obsidian = lexSource('[[Page]]', 'obsidian')[0].range;
 * const tiddlyWiki = lexSource('[[Page]]', 'tiddlywiki')[0].range;
 * obsidian; // { start: 0, end: 8 }
 * tiddlyWiki; // { start: 0, end: 8 }
 * ```
 */
export type SourceRange = { start: number; end: number };
