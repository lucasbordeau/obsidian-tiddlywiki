import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findQuotedEnd } from '@/modules/conversion-core/lexing/boundaries/findQuotedEnd';

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
