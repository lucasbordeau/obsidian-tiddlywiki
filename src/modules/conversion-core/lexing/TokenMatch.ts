/**
 * A scanner's proposed token kind and exclusive absolute UTF-16 end offset.
 * `lexSource` supplies the start offset and copies the matching source slice.
 *
 * ```ts
 * const source = '[[Note]] after';
 * const cursor = 0;
 * const match: TokenMatch = { kind: 'link', end: 8 };
 * source.slice(cursor, match.end); // '[[Note]]'
 * const obsidian = lexSource(source, 'obsidian')[0];
 * const tiddlyWiki = lexSource(source, 'tiddlywiki')[0];
 * obsidian.range; // { start: 0, end: 8 }
 * tiddlyWiki.range; // { start: 0, end: 8 }
 * ```
 */
export type TokenMatch = { kind: string; end: number };
