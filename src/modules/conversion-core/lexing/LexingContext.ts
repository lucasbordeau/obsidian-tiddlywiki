import { Dialect } from '@/modules/conversion-core/model/Dialect';
import { LexingScanState } from '@/modules/conversion-core/lexing/LexingScanState';

/**
 * Inputs shared by scanners at one absolute UTF-16 cursor position.
 * `rest` begins at `cursor`; `isLinePrefix` allows block syntax here. The
 * optional Obsidian boundary indexes are built once for the whole source so
 * each Markdown reference scanner can reject unmatched delimiters cheaply.
 *
 * ```ts
 * const source = '[Guide](guide.md)';
 * const obsidianContext: LexingContext = {
 *   source,
 *   dialect: 'obsidian',
 *   cursor: 0,
 *   rest: source,
 *   isLinePrefix: true,
 *   markdownLabelEnds: indexMarkdownLabelEnds(source),
 *   markdownBareParenthesisEnds: indexMarkdownBareParenthesisEnds(source),
 *   scanState: {},
 * };
 * scanMarkdownReference(obsidianContext);
 * // { kind: 'link', end: source.length }
 *
 * const tiddlywikiContext: LexingContext = {
 *   source: '! Heading',
 *   dialect: 'tiddlywiki',
 *   cursor: 0,
 *   rest: '! Heading',
 *   isLinePrefix: true,
 * };
 * scanBlockMarker(tiddlywikiContext); // { kind: 'block-marker', end: 1 }
 * ```
 */
export type LexingContext = {
  source: string;
  dialect: Dialect;
  cursor: number;
  rest: string;
  isLinePrefix: boolean;
  markdownLabelEnds?: readonly number[];
  markdownBareParenthesisEnds?: readonly number[];
  scanState?: LexingScanState;
};
