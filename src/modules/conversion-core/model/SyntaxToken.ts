import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

/**
 * One concrete source slice returned by the lexer, with an exclusive end offset.
 * The kind describes lexical recognition; dialect parsers build semantic nodes separately.
 *
 * ```ts
 * const token: SyntaxToken = {
 *   kind: 'link',
 *   range: { start: 0, end: 8 },
 *   raw: '[[Note]]',
 * };
 * const tiddlyWikiToken: SyntaxToken = {
 *   kind: 'transclusion',
 *   range: { start: 0, end: 8 },
 *   raw: '{{Note}}',
 * };
 * lexSource('[[Note]]', 'obsidian')[0]; // same shape as token
 * lexSource('{{Note}}', 'tiddlywiki')[0]; // same shape as tiddlyWikiToken
 * ```
 */
export type SyntaxToken = { kind: string; range: SourceRange; raw: string };
