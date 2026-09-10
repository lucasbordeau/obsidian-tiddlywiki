import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { quotedEnd } from '../../boundaries/attributes/quotedEnd';

export function scanHtmlTag(context: LexingContext): TokenMatch | undefined {
  const { source, cursor, rest } = context;
  const htmlTag = /^<\/?[\w$][\w$:-]*/.exec(rest);

  if (htmlTag) {
    return {
      kind: htmlTag[0].includes('$') ? 'widget' : 'html',
      end: quotedEnd(source, cursor + htmlTag[0].length, '>'),
    };
  }

  return undefined;
}
