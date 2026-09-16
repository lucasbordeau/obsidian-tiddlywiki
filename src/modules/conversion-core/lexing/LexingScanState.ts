/**
 * Mutable facts shared by scanners during one `lexSource` call.
 * A failed wiki opener records its line end, so later openers on that line can
 * fail immediately. A macro scanner records the final raw `>>` position, so
 * later `<<` openers cannot repeatedly search a suffix without any closer.
 * Inline code pre-indexes exact-length closing backtick runs so unmatched
 * openers do not repeatedly search the suffix.
 *
 * ```ts
 * const obsidianSource = '[[bad\n[[good]]';
 * const obsidianState: LexingScanState = {};
 * scanWikiReference({ source: obsidianSource, dialect: 'obsidian',
 *   cursor: 0, rest: obsidianSource, isLinePrefix: true,
 *   scanState: obsidianState }); // { kind: 'text', end: 2 }
 * obsidianState.wikiUnclosedLineEnd; // 5, before the newline
 *
 * const wikiTextSource = '<<bad';
 * const wikiTextState: LexingScanState = {};
 * scanMacro({ source: wikiTextSource, dialect: 'tiddlywiki',
 *   cursor: 0, rest: wikiTextSource, isLinePrefix: true,
 *   scanState: wikiTextState }); // { kind: 'text', end: 2 }
 * wikiTextState.macroLastRawCloser; // -1, no `>>` exists
 * ```
 */
export type LexingScanState = {
  wikiUnclosedLineEnd?: number;
  macroLastRawCloser?: number;
  inlineCodeClosingEnds?: Map<number, number>;
};
