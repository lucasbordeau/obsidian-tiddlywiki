import type { Token } from '../../types/Token';
import type { TokenCursor } from '../../types/TokenCursor';
import type { ParseContext } from '../../types/ParseContext';
import type { BlockCollector } from '../../types/BlockCollector';
import type { BlockNode } from '../../../../model/blocks/BlockNode';
import { getInlinePlainText } from '../inlines/getInlinePlainText';

export function parseQuote(
  tokens: Token[],
  cursor: TokenCursor,
  context: ParseContext,
  collectNestedBlocks: BlockCollector,
): BlockNode {
  const children = collectNestedBlocks(
    tokens,
    cursor,
    context,
    'blockquote_close',
  );

  const quote: BlockNode = { type: 'quote', children };

  const firstParagraph = children[0];

  const firstInline =
    firstParagraph?.type === 'paragraph'
      ? firstParagraph.children[0]
      : undefined;

  const calloutMatch =
    firstInline?.type === 'text'
      ? /^\[!([\w-]+)\]([+-])?(?:[ \t]+|$)/.exec(firstInline.value)
      : null;

  const hasCalloutHeader =
    calloutMatch !== null &&
    firstParagraph?.type === 'paragraph' &&
    firstInline?.type === 'text';

  if (!hasCalloutHeader) {
    return quote;
  }

  const titleNodes = firstParagraph.children;

  firstInline.value = firstInline.value.slice(calloutMatch[0].length);

  const titleEnd = titleNodes.findIndex((node) => node.type === 'break');
  const title = titleEnd === -1 ? titleNodes : titleNodes.slice(0, titleEnd);
  const titleText = getInlinePlainText(title);
  const hasFormattedTitle = title.some((node) => node.type !== 'text');

  quote.callout = { type: calloutMatch[1], title: titleText };

  if (hasFormattedTitle) {
    quote.callout.titleNodes = title.filter(
      (node) => node.type !== 'text' || node.value !== '',
    );
  }

  if (calloutMatch[2]) {
    quote.callout.fold = calloutMatch[2] as '+' | '-';
  }

  if (titleEnd === -1) {
    children.shift();
  } else {
    firstParagraph.children = titleNodes.slice(titleEnd + 1);
  }

  return quote;
}
