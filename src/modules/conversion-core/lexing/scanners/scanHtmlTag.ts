import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';
import { findQuotedEnd } from '../boundaries/findQuotedEnd';

export function scanHtmlTag(context: LexingContext): TokenMatch | undefined {
  const { source, cursor, rest } = context;
  const htmlTag = /^<\/?[\w$][\w$:-]*/.exec(rest);

  if (htmlTag) {
    return {
      kind: htmlTag[0].includes('$') ? 'widget' : 'html',
      end: findQuotedEnd(source, cursor + htmlTag[0].length, '>'),
    };
  }

  return undefined;
}
