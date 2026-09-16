/**
 * Syntax selection for scanners and dialect parsers.
 *
 * ```ts
 * const obsidian: Dialect = 'obsidian';
 * const tiddlyWiki: Dialect = 'tiddlywiki';
 * lexSource('[[Note]]', obsidian)[0].kind; // 'link'
 * lexSource('[[Note]]', tiddlyWiki)[0].kind; // 'link'
 * ```
 */
export type Dialect = 'obsidian' | 'tiddlywiki';
