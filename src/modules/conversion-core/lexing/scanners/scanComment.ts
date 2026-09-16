import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findDelimitedEnd } from '@/modules/conversion-core/lexing/boundaries/findDelimitedEnd';

/**
 * Group HTML comments and the active dialect's comment syntax into one token.
 * An unfinished comment currently runs through the remaining source.
 *
 * ```ts
 * lexSource('%% hidden %%', 'obsidian')[0];
 * // { kind: 'comment', range: { start: 0, end: 12 }, raw: '%% hidden %%' }
 * lexSource('/% hidden %/', 'tiddlywiki')[0];
 * // { kind: 'comment', range: { start: 0, end: 12 }, raw: '/% hidden %/' }
 * lexSource('<!-- [[hidden]] --> [[visible]]', 'obsidian')
 *   .filter(({ kind }) => kind === 'link')
 *   .map(({ raw }) => raw); // ['[[visible]]']
 * ```
 */
export function scanComment(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  if (source.startsWith('<!--', cursor)) {
    const closing = source.indexOf('-->', cursor + 4);

    return { kind: 'comment', end: closing < 0 ? source.length : closing + 3 };
  }

  if (dialect === 'obsidian' && source.startsWith('%%', cursor)) {
    return { kind: 'comment', end: findDelimitedEnd(source, cursor + 2, '%%') };
  }

  if (dialect === 'tiddlywiki' && source.startsWith('/%', cursor)) {
    return { kind: 'comment', end: findDelimitedEnd(source, cursor + 2, '%/') };
  }

  return undefined;
}
